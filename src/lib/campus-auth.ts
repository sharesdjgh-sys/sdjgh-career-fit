import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

const VERIFY_URL = process.env.PLATFORM_VERIFY_URL || "https://platform.sdjgh-ai.kr/api/auth/verify";
const positive = new Map<string, number>();

/** 플랫폼 서명과 진로 상담 앱 정책을 서버에서 확인한다. 실패 시 기존 허용 기록도 폐기한다. */
export async function hasCampusAccess(request: NextRequest, force = false): Promise<boolean> {
  const token = /^Bearer ([^\s]{20,8192})$/i.exec(request.headers.get("authorization") || "")?.[1];
  if (!token) return false;
  const key = createHash("sha256").update(token).digest("hex");
  const now = Date.now();
  if (!force && (positive.get(key) || 0) > now) return true;
  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token, appId: "career" }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const body = response.ok ? await response.json() as { valid?: boolean; user?: { userId?: string } } : null;
    const allowed = body?.valid === true && typeof body.user?.userId === "string" && !!body.user.userId;
    if (allowed) {
      // 서버리스 인스턴스가 오래 살아도 사용자별 캐시가 무한히 쌓이지 않도록 제한한다.
      if (positive.size >= 1024) positive.clear();
      positive.set(key, now + 60_000);
    }
    else positive.delete(key);
    return allowed;
  } catch {
    positive.delete(key);
    return false;
  }
}
