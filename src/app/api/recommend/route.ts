import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllJobs } from "@/lib/jobs";
import {
  prefilterCandidates,
  templateReason,
  toMatchingPercent,
  toRecommendation,
  type ScoredJob,
} from "@/lib/scoring";
import { studentProfileSchema, rerankResultSchema } from "@/lib/schemas";
import { getAnthropic, hasApiKey, MODEL, toApiError } from "@/lib/anthropic";
import { RERANK_SCHEMA, RERANK_SYSTEM } from "@/lib/prompts";
import type { Recommendation, RecommendResponse, StudentProfile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  profile: studentProfileSchema,
  skipAi: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const profile = body.profile as StudentProfile;
  const candidates = prefilterCandidates(getAllJobs(), profile, 30);

  if (!body.skipAi && hasApiKey()) {
    try {
      const recommendations = await rerankWithClaude(profile, candidates);
      if (recommendations) {
        const res: RecommendResponse = { ok: true, source: "ai", recommendations };
        return NextResponse.json(res);
      }
    } catch (err) {
      // AI 실패는 치명적이지 않음 — 룰 기반으로 폴백
      console.error("rerank failed, falling back to rule-based", toApiError(err));
    }
  }

  const res: RecommendResponse = {
    ok: true,
    source: "rule",
    recommendations: ruleBasedTop10(profile, candidates),
  };
  return NextResponse.json(res);
}

function ruleBasedTop10(profile: StudentProfile, candidates: ScoredJob[]): Recommendation[] {
  return candidates
    .slice(0, 10)
    .map((sj) =>
      toRecommendation(sj, toMatchingPercent(sj.score), templateReason(sj, profile)),
    );
}

/** 후보 30개 → Claude 재랭킹 Top 10. 검증 실패 시 null 반환(폴백 유도) */
async function rerankWithClaude(
  profile: StudentProfile,
  candidates: ScoredJob[],
): Promise<Recommendation[] | null> {
  const byId = new Map(candidates.map((sj) => [sj.job.id, sj]));

  // 후보를 토큰 효율적인 다이제스트로 직렬화
  const digest = candidates.map((sj) => ({
    jobId: sj.job.id,
    name: sj.job.name,
    category: sj.job.categoryName,
    jobType: sj.job.jobType,
    holland: sj.job.holland,
    salaryLevel: sj.job.salaryLevel,
    growthPotential: sj.job.growthPotential,
    jobStability: sj.job.jobStability,
    wlbLevel: sj.job.wlbLevel,
    track: sj.job.collegeTrack,
    majors: sj.job.majors.slice(0, 4),
    subjects: sj.job.highSchoolSubjects,
    aptitudes: sj.job.aptitudeFactors,
    tags: sj.job.tags.slice(0, 5),
    detScore: toMatchingPercent(sj.score),
  }));

  const profileDigest = {
    holland: profile.holland,
    aptitudes: profile.aptitudes,
    values: profile.values,
    interestCategories: profile.interestCategories,
    favoriteSubjects: profile.favoriteSubjects,
    freeText: profile.freeText ?? null,
    mbti: profile.mbti ?? null,
    grade: profile.grade,
    track: profile.track,
  };

  const response = await getAnthropic().messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: RERANK_SYSTEM,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: RERANK_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `[학생 프로필]\n${JSON.stringify(profileDigest, null, 1)}\n\n[직업 후보 30개]\n${JSON.stringify(digest, null, 1)}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) return null;

  const parsed = rerankResultSchema.safeParse(JSON.parse(text));
  if (!parsed.success) return null;

  // 허용목록 검증 + 매칭도 클램프
  const seen = new Set<string>();
  const out: Recommendation[] = [];
  for (const rec of parsed.data.recommendations) {
    const sj = byId.get(rec.jobId);
    if (!sj || seen.has(rec.jobId)) continue;
    seen.add(rec.jobId);
    const det = toMatchingPercent(sj.score);
    const matching = Math.min(Math.min(97, det + 15), Math.max(Math.max(60, det - 10), rec.matching));
    out.push(toRecommendation(sj, matching, rec.reason));
    if (out.length >= 10) break;
  }

  // 10개 미만이면 결정적 순위로 보충
  if (out.length < 10) {
    for (const sj of candidates) {
      if (out.length >= 10) break;
      if (seen.has(sj.job.id)) continue;
      seen.add(sj.job.id);
      out.push(
        toRecommendation(sj, toMatchingPercent(sj.score), templateReason(sj, profile)),
      );
    }
  }
  return out.length > 0 ? out : null;
}
