import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getJob, getJobContent } from "@/lib/jobs";
import { getAnthropic, hasApiKey, MODEL, toApiError } from "@/lib/anthropic";
import { REPORT_SCHEMA, REPORT_SYSTEM } from "@/lib/prompts";
import { reportResultSchema, studentProfileSchema } from "@/lib/schemas";
import type { CareerReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  profile: studentProfileSchema,
  recommendations: z
    .array(
      z.object({
        jobId: z.string(),
        name: z.string(),
        matching: z.number(),
        reason: z.string(),
      }),
    )
    .min(1)
    .max(12),
  selectedJobIds: z.array(z.string()).max(5).optional(),
});

export async function POST(req: NextRequest) {
  if (!hasApiKey()) {
    return NextResponse.json(
      { ok: false, error: "AI 보고서 기능을 사용할 수 없어요. 관리자에게 문의해주세요." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { profile, recommendations } = body;
  const targetIds = (body.selectedJobIds?.length
    ? body.selectedJobIds
    : recommendations.slice(0, 3).map((r) => r.jobId)
  ).slice(0, 5);

  // 선택 직업의 직업백과 본문 로드 (보고서의 근거 자료)
  const jobDocs = targetIds
    .map((id) => {
      const job = getJob(id);
      const content = getJobContent(id);
      const rec = recommendations.find((r) => r.jobId === id);
      if (!job || !content) return null;
      return {
        jobId: id,
        name: job.name,
        matching: rec?.matching ?? 75,
        recReason: rec?.reason ?? "",
        majors: job.majors,
        highSchoolSubjects: job.highSchoolSubjects,
        collegeTrack: job.collegeTrack,
        content,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  if (jobDocs.length === 0) {
    return NextResponse.json(
      { ok: false, error: "보고서를 만들 직업 정보를 찾지 못했어요." },
      { status: 404 },
    );
  }

  const profileText = `[학생 프로필]
- Holland 유형: 주 ${profile.holland.primary}, 부 ${profile.holland.secondary ?? "없음"}${
    profile.holland.scores ? `, 점수: ${JSON.stringify(profile.holland.scores)}` : ""
  }
- 강점 적성: ${profile.aptitudes.join(", ") || "정보 없음"}
- 가치관 우선순위: ${profile.values.join(" > ") || "정보 없음"}
- 좋아하는 과목: ${profile.favoriteSubjects.join(", ") || "정보 없음"}
- 학년: 고${profile.grade}, 계열: ${profile.track}${profile.mbti ? `, MBTI: ${profile.mbti}` : ""}${
    profile.freeText ? `\n- 학생의 말: ${profile.freeText}` : ""
  }`;

  const jobsText = jobDocs
    .map(
      (d) => `=== 추천 직업: ${d.name} (jobId: ${d.jobId}, 매칭도 ${d.matching}%) ===
추천 이유: ${d.recReason}
추천 전공: ${d.majors.join(", ")}
고교 추천 과목: ${d.highSchoolSubjects.join(", ")}
계열: ${d.collegeTrack}

[직업백과 본문]
${d.content}`,
    )
    .join("\n\n");

  try {
    // 보고서는 출력이 길어 서버 측 스트리밍으로 타임아웃 방지 후 완성본 반환
    const response = await getAnthropic()
      .messages.stream({
        model: MODEL,
        max_tokens: 8000,
        system: REPORT_SYSTEM,
        output_config: {
          effort: "medium",
          format: { type: "json_schema", schema: REPORT_SCHEMA },
        },
        messages: [
          {
            role: "user",
            content: `${profileText}\n\n${jobsText}\n\n위 자료를 근거로 이 학생을 위한 진로 분석 보고서를 작성해주세요.`,
          },
        ],
      })
      .finalMessage();

    const text = response.content.find((b) => b.type === "text")?.text;
    const parsed = reportResultSchema.safeParse(JSON.parse(text ?? ""));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "보고서 생성에 실패했어요. 다시 시도해주세요." },
        { status: 502 },
      );
    }

    const report: CareerReport = {
      generatedAt: new Date().toISOString(),
      ...parsed.data,
    };
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    const { status, message } = toApiError(err);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
