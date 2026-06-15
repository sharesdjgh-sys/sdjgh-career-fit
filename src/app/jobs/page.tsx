import type { Metadata } from "next";
import { getAllJobs } from "@/lib/jobs";
import { CATEGORY_ORDER } from "@/lib/categories";
import JobsExplorer, { type JobCard, type CategorySummary } from "@/components/JobsExplorer";

export const metadata: Metadata = {
  title: "직업 탐색 — 진로나침반",
  description:
    "11개 직업 분야와 표준직업분류로 정리한 579개 직업을 한눈에 둘러보고, 관심 직업의 상세 정보를 확인해 보세요.",
};

export default function JobsIndexPage() {
  const jobs = getAllJobs();

  // 클라이언트로 넘길 경량 카드 데이터 (필요한 필드만)
  const cards: JobCard[] = jobs.map((j) => ({
    id: j.id,
    name: j.name,
    categoryName: j.categoryName,
    stdCategory: j.stdCategory,
    jobType: j.jobType,
    salaryLevel: j.salaryLevel,
    collegeTrack: j.collegeTrack,
    holland: j.holland,
    tags: j.tags.slice(0, 2),
  }));

  // 분야별 집계: 직업 수 + 대표 표준분류 상위 3개
  const summaries: CategorySummary[] = CATEGORY_ORDER.map((name) => {
    const inCat = cards.filter((c) => c.categoryName === name);
    const stdCount = new Map<string, number>();
    for (const c of inCat) stdCount.set(c.stdCategory, (stdCount.get(c.stdCategory) ?? 0) + 1);
    const topStd = [...stdCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([std]) => std);
    return { name, count: inCat.length, topStd };
  }).filter((s) => s.count > 0);

  return <JobsExplorer cards={cards} summaries={summaries} total={cards.length} />;
}
