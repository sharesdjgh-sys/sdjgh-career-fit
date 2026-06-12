"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/storage";
import { Target } from "lucide-react";

/** SSG 직업 상세 페이지 위에 개인 매칭도를 오버레이하는 클라이언트 컴포넌트 */
export default function MatchBadge({ jobId }: { jobId: string }) {
  const [matching, setMatching] = useState<number | null>(null);

  useEffect(() => {
    const rec = store.getRecommendations()?.find((r) => r.jobId === jobId);
    if (rec) setMatching(rec.matching);
  }, [jobId]);

  if (matching === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-primary-600 shadow-sm">
      <Target className="h-3.5 w-3.5" />
      나와의 매칭도 {matching}%
    </span>
  );
}
