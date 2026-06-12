import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/** AI 라우트 공용 모델 — plan.md 6장 */
export const MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropic(): Anthropic {
  if (!client) {
    client = new Anthropic(); // ANTHROPIC_API_KEY 환경변수 사용
  }
  return client;
}

/** API 오류 → 사용자용 한국어 메시지 + HTTP 상태 */
export function toApiError(err: unknown): { status: number; message: string } {
  if (err instanceof Anthropic.RateLimitError) {
    return { status: 429, message: "요청이 많아요. 잠시 후 다시 시도해주세요." };
  }
  if (err instanceof Anthropic.APIError) {
    console.error("Anthropic API error", err.status, err.message, err.requestID);
    return { status: 502, message: "AI 분석 중 문제가 발생했어요. 잠시 후 다시 시도해주세요." };
  }
  console.error("Unexpected error", err);
  return { status: 500, message: "처리 중 문제가 발생했어요. 다시 시도해주세요." };
}
