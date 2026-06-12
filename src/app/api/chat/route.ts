import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getJob, getJobContent } from "@/lib/jobs";
import { getAnthropic, hasApiKey, MODEL, toApiError } from "@/lib/anthropic";
import { CHAT_SYSTEM_BASE } from "@/lib/prompts";
import { studentProfileSchema } from "@/lib/schemas";
import type Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  profile: studentProfileSchema.nullable(),
  jobId: z.string().regex(/^\d+$/).optional(),
  topJobs: z.array(z.string()).max(10).optional(), // 추천 직업명 (사이드 컨텍스트)
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(req: NextRequest) {
  if (!hasApiKey()) {
    return NextResponse.json(
      { ok: false, error: "AI 상담 기능을 사용할 수 없어요. 관리자에게 문의해주세요." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { profile, jobId, topJobs, messages } = body;

  // 시스템 프롬프트: 고정 베이스 → 프로필 → 직업 본문(캐시 대상) 순
  const systemBlocks: Anthropic.TextBlockParam[] = [
    { type: "text", text: CHAT_SYSTEM_BASE },
  ];

  if (profile) {
    systemBlocks.push({
      type: "text",
      text: `[상담 중인 학생 정보]
- Holland 유형: 주 ${profile.holland.primary}, 부 ${profile.holland.secondary ?? "없음"}
- 강점 적성: ${profile.aptitudes.join(", ") || "정보 없음"}
- 가치관: ${profile.values.join(" > ") || "정보 없음"}
- 학년: 고${profile.grade}, 계열: ${profile.track}${profile.mbti ? `, MBTI: ${profile.mbti}` : ""}${
        topJobs?.length ? `\n- AI 추천 직업: ${topJobs.join(", ")}` : ""
      }${profile.freeText ? `\n- 학생의 말: ${profile.freeText}` : ""}`,
    });
  }

  if (jobId) {
    const job = getJob(jobId);
    const content = getJobContent(jobId);
    if (job && content) {
      systemBlocks.push({
        type: "text",
        text: `[현재 상담 주제 직업: ${job.name}]\n아래 직업백과 본문을 근거로 답하세요.\n\n${content}`,
      });
    }
  }

  // 마지막 시스템 블록에 캐시 → 멀티턴 대화에서 시스템 전체 재사용
  systemBlocks[systemBlocks.length - 1].cache_control = { type: "ephemeral" };

  try {
    const stream = getAnthropic().messages.stream({
      model: MODEL,
      max_tokens: 1500,
      output_config: { effort: "low" },
      system: systemBlocks,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("chat stream error", err);
          controller.enqueue(
            encoder.encode("\n\n(연결이 끊겼어요. 다시 질문해주세요.)"),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const { status, message } = toApiError(err);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
