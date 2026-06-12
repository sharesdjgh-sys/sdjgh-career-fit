import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/jobs";
import type { CollegeTrack } from "@/lib/types";

export const metadata = { title: "전공·학습 로드맵 — 진로나침반" };

/** 계열별 수능 전략 기본 안내 */
const EXAM_STRATEGY: Record<CollegeTrack, { combo: string; tip: string }> = {
  이과: {
    combo: "수학(미적분 또는 기하) + 과학탐구 2과목",
    tip: "지망 학과에 따라 물리학·화학·생명과학 중 필수 과목이 다르니 모집요강을 꼭 확인하세요.",
  },
  문과: {
    combo: "수학(확률과 통계) + 사회탐구 2과목",
    tip: "상위권 대학 상경계열은 수학 반영 비율이 높으니 수학을 놓지 마세요.",
  },
  예체능: {
    combo: "국어·영어 중심 + 실기 준비",
    tip: "실기 비중이 큰 만큼 1~2학년부터 포트폴리오/실기 연습을 꾸준히 쌓는 것이 중요해요.",
  },
};

/** 직업의 추천 과목을 학년별로 배치하는 간단한 로드맵 휴리스틱 */
function buildRoadmap(subjects: string[], track: CollegeTrack) {
  const advanced = subjects.filter((s) => /II|미적분|확률과통계|물리학II|화학II|생명과학II/.test(s));
  const basic = subjects.filter((s) => !advanced.includes(s));
  return [
    {
      grade: "고1",
      subjects: ["국어", "영어", "수학 (공통)"],
      activity: "공통과목 기초 다지기 · 관련 분야 독서와 동아리 탐색",
    },
    {
      grade: "고2",
      subjects: basic.length > 0 ? basic : subjects.slice(0, 3),
      activity: "진로 선택과목 수강 · 교내 대회/프로젝트 참여",
    },
    {
      grade: "고3",
      subjects: advanced.length > 0 ? advanced : ["심화 선택과목", "수능 연계 과목"],
      activity: `수능 대비 (${EXAM_STRATEGY[track].combo}) · 학생부 마무리`,
    },
  ];
}

export default async function MajorsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job: jobId } = await searchParams;

  if (!jobId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-4xl">🎓</div>
        <h1 className="mt-4 text-xl font-bold">직업을 먼저 선택해주세요</h1>
        <p className="mt-2 text-sm text-ink-soft">
          추천 결과에서 관심 있는 직업을 고르면 전공과 학습 로드맵을 보여드려요.
        </p>
        <Link
          href="/results"
          className="mt-6 inline-block rounded-btn bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
        >
          추천 결과 보기
        </Link>
      </div>
    );
  }

  const job = getJob(jobId);
  if (!job) notFound();

  const roadmap = buildRoadmap(job.highSchoolSubjects, job.collegeTrack);
  const exam = EXAM_STRATEGY[job.collegeTrack];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24">
      <p className="text-sm text-ink-soft">
        <Link href={`/jobs/${job.id}`} className="text-primary hover:underline">
          {job.name}
        </Link>{" "}
        을(를) 위한
      </p>
      <h1 className="mt-1 text-2xl font-bold">전공·학습 로드맵 가이드</h1>
      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary-dark">
        추천 계열: {job.collegeTrack}
      </div>

      {/* 추천 학과 카드 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold">🎓 추천 학과 (우선순위순)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {job.majors.map((m, i) => (
            <div
              key={m}
              className="rounded-card border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">
                  {i + 1}. {m}
                </h3>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                  {job.collegeTrack}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                주요 연계 과목: {job.highSchoolSubjects.slice(0, 3).join(", ")}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                졸업 후 진출: {[job.name, ...job.relatedJobs.slice(0, 2)].join(", ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 고교 학습 로드맵 타임라인 */}
      <section className="mt-10">
        <h2 className="text-lg font-bold">🗺️ 고교 학습 로드맵</h2>
        <div className="mt-4 space-y-0">
          {roadmap.map((step, i) => (
            <div key={step.grade} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {step.grade}
                </div>
                {i < roadmap.length - 1 && <div className="w-0.5 flex-1 bg-primary-light" />}
              </div>
              <div className="flex-1 pb-6">
                <div className="rounded-card border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap gap-1.5">
                    {step.subjects.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-primary-light px-2.5 py-1 text-xs font-medium text-primary-dark"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">{step.activity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 수능 전략 박스 */}
      <section className="mt-6 rounded-card border border-accent bg-accent-light/60 p-5">
        <h2 className="text-base font-bold text-amber-800">🎯 수능 선택과목 전략</h2>
        <p className="mt-2 text-sm font-medium">{exam.combo}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{exam.tip}</p>
      </section>

      <div className="mt-8 rounded-card bg-primary-light/50 p-5 text-sm leading-relaxed">
        💡 나만의 학년별 상세 로드맵과 자격증·활동 추천은{" "}
        <Link href="/report" className="font-bold text-primary hover:underline">
          AI 분석 보고서
        </Link>
        에서 받아볼 수 있어요.
      </div>

      {/* 하단 액션 바 */}
      <div className="print-hidden fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl justify-center gap-3 px-4">
          <Link
            href={`/jobs/${job.id}`}
            className="rounded-btn border border-slate-200 px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-slate-50"
          >
            ← 직업 상세로
          </Link>
          <Link
            href={`/chat?job=${job.id}`}
            className="flex-1 rounded-btn border border-primary px-4 py-2.5 text-center text-sm font-bold text-primary transition hover:bg-primary-light sm:flex-none sm:px-6"
          >
            💬 AI 상담사에게 물어보기
          </Link>
          <Link
            href="/report"
            className="flex-1 rounded-btn bg-primary px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-primary-dark sm:flex-none sm:px-6"
          >
            📄 AI 보고서 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
