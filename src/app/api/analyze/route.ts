import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropic, hasApiKey, MODEL, toApiError } from "@/lib/anthropic";
import { ANALYZE_PHOTO_SYSTEM, ANALYZE_QUICK_SYSTEM, ANALYZE_SCHEMA } from "@/lib/prompts";
import { analyzeResultSchema, studentProfileSchema } from "@/lib/schemas";
import type { HollandCode, StudentProfile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const photoBody = z.object({
  mode: z.literal("photo"),
  images: z
    .array(
      z.object({
        mediaType: z.enum(MEDIA_TYPES),
        data: z.string().max(4_000_000), // base64 — 클라이언트 리사이즈 전제 (Vercel body 4.5MB 한도)
      }),
    )
    .min(1)
    .max(3),
  extra: z.object({
    mbti: z.string().regex(/^[EI][SN][TF][JP]$/i).optional().or(z.literal("")),
    grade: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    track: z.enum(["이과", "문과", "예체능", "미정"]),
    note: z.string().max(1000).optional(),
  }),
});

const quickBody = z.object({
  mode: z.literal("quick"),
  profile: studentProfileSchema,
});

const bodySchema = z.discriminatedUnion("mode", [photoBody, quickBody]);

export async function POST(req: NextRequest) {
  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (body.mode === "quick") {
    return handleQuick(body);
  }
  return handlePhoto(body);
}

/** 간편 입력: 결정적 프로필을 기반으로, 자유 서술이 있고 API 키가 있으면 Claude로 보정 */
async function handleQuick(body: z.infer<typeof quickBody>) {
  const profile = body.profile as StudentProfile;

  if (!profile.freeText || !hasApiKey()) {
    return NextResponse.json({ ok: true, profile });
  }

  try {
    const response = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: ANALYZE_QUICK_SYSTEM,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: ANALYZE_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `[구조화된 답변으로 만든 프로필]
- 주유형 후보: ${profile.holland.primary}, 부유형 후보: ${profile.holland.secondary ?? "없음"}
- 적성 요인 추정: ${profile.aptitudes.join(", ")}
- 가치관(선택 순서): ${profile.values.join(", ")}
- 관심 분야: ${profile.interestCategories.join(", ") || "없음"}
- 좋아하는 과목: ${profile.favoriteSubjects.join(", ") || "없음"}
- 학년: 고${profile.grade}, 계열: ${profile.track}${profile.mbti ? `, MBTI: ${profile.mbti}` : ""}

[학생의 자유 서술]
${profile.freeText}`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text")?.text;
    const parsed = analyzeResultSchema.safeParse(JSON.parse(text ?? ""));
    if (!parsed.success) {
      return NextResponse.json({ ok: true, profile }); // 보정 실패 → 결정적 프로필 그대로
    }
    const r = parsed.data;
    const refined: StudentProfile = {
      ...profile,
      holland: {
        primary: r.holland_primary,
        secondary: r.holland_secondary,
      },
      aptitudes: r.aptitudes.length > 0 ? r.aptitudes.slice(0, 4) : profile.aptitudes,
      values: r.values.length > 0 ? r.values.slice(0, 5) : profile.values,
      confidence: r.confidence,
      warnings: r.warnings.length > 0 ? r.warnings : undefined,
    };
    return NextResponse.json({ ok: true, profile: refined });
  } catch (err) {
    console.error("quick refine failed", toApiError(err));
    return NextResponse.json({ ok: true, profile }); // 폴백: 결정적 프로필
  }
}

/** 결과지 사진: Claude Vision으로 Holland/적성/가치관 추출 */
async function handlePhoto(body: z.infer<typeof photoBody>) {
  if (!hasApiKey()) {
    return NextResponse.json(
      {
        ok: false,
        fallback: "quick",
        error: "사진 분석을 사용할 수 없어요. 간편 입력으로 진행해주세요.",
      },
      { status: 503 },
    );
  }

  const { images, extra } = body;
  try {
    const response = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: ANALYZE_PHOTO_SYSTEM,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: ANALYZE_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            ...images.map(
              (img) =>
                ({
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: img.mediaType,
                    data: img.data,
                  },
                }) as const,
            ),
            {
              type: "text",
              text: `위 이미지는 학생이 업로드한 진로심리검사 결과지입니다. 검사 결과를 추출해주세요.
학생 추가 정보: 학년 고${extra.grade}, 계열 ${extra.track}${extra.mbti ? `, MBTI ${extra.mbti.toUpperCase()}` : ""}${extra.note ? `\n학생이 남긴 말: ${extra.note}` : ""}`,
            },
          ],
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text")?.text;
    const parsed = analyzeResultSchema.safeParse(JSON.parse(text ?? ""));
    if (!parsed.success || !parsed.data.parse_ok) {
      return NextResponse.json({
        ok: false,
        fallback: "quick",
        error: "결과지를 읽지 못했어요. 사진을 다시 찍거나 간편 입력으로 진행해주세요.",
      });
    }

    const r = parsed.data;
    const scores = Object.fromEntries(
      Object.entries(r.holland_scores ?? {}).filter(([, v]) => v !== null),
    ) as Partial<Record<HollandCode, number>>;

    const profile: StudentProfile = {
      source: "photo",
      holland: {
        primary: r.holland_primary,
        secondary: r.holland_secondary,
        scores: Object.keys(scores).length > 0 ? scores : undefined,
      },
      aptitudes: r.aptitudes.slice(0, 4),
      values: r.values.slice(0, 5),
      interestCategories: [],
      favoriteSubjects: [],
      freeText: extra.note?.trim() || undefined,
      mbti: extra.mbti ? extra.mbti.toUpperCase() : undefined,
      grade: extra.grade,
      track: extra.track,
      confidence: r.confidence,
      warnings: r.warnings.length > 0 ? r.warnings : undefined,
    };
    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    const { status, message } = toApiError(err);
    return NextResponse.json(
      { ok: false, fallback: "quick", error: message },
      { status },
    );
  }
}
