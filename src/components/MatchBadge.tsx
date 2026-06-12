"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/storage";

/** SSG 직업 상세 페이지 위에 개인 매칭도를 오버레이하는 클라이언트 컴포넌트 */
export default function MatchBadge({ jobId }: { jobId: string }) {
  const [matching, setMatching] = useState<number | null>(null);

  useEffect(() => {
    const rec = store.getRecommendations()?.find((r) => r.jobId === jobId);
    if (rec) setMatching(rec.matching);
  }, [jobId]);

  if (matching === null) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white backdrop-blur">
      🎯 나와의 매칭도 {matching}%
    </span>
  );
}
