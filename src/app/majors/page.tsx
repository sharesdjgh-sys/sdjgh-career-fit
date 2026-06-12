import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/jobs";
import type { CollegeTrack } from "@/lib/types";
import {
  GraduationCap,
  Map,
  Target,
  Sparkles,
  ArrowRight,
  MessageSquare,
  FileText,
  Lightbulb,
  ChevronLeft
} from "lucide-react";

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
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
          <GraduationCap className="h-6 w-6" strokeWidth={2} />
        </div>
        <h1 className="mt-5 text-lg font-bold text-ink">직업을 먼저 선택해 주세요</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          추천 결과에서 관심 있는 직업을 고르면 전공과 학습 로드맵 정보를 확인할 수 있습니다.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/results"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            추천 결과 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const job = getJob(jobId);
  if (!job) notFound();

  const roadmap = buildRoadmap(job.highSchoolSubjects, job.collegeTrack);
  const exam = EXAM_STRATEGY[job.collegeTrack];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-32 sm:py-16">
      <Link
        href={`/jobs/${job.id}`}
        className="mb-4 inline-flex items-center gap-1 rounded-full text-sm font-semibold text-ink-soft transition duration-200 hover:text-primary-600"
      >
        <ChevronLeft className="h-4 w-4" />
        직업 정보로 돌아가기
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {job.name} 전공·학습 로드맵
      </h1>

      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
        <Sparkles className="h-3.5 w-3.5" />
        추천 계열: {job.collegeTrack}
      </div>

      {/* 추천 학과 카드 */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink sm:text-2xl">
            <GraduationCap className="h-5 w-5 text-primary-500" strokeWidth={2} />
            추천 학과
          </h2>
          <p className="mt-2 text-sm text-ink-lighter">우선순위가 높은 학과부터 보여드려요</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {job.majors.map((m, i) => (
            <div key={m} className="flex h-full flex-col rounded-xl border border-line bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 text-lg font-bold text-ink">
                  {i + 1}. {m}
                </h3>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-50 px-3 py-1 text-xs font-semibold text-ink-soft">
                  {job.collegeTrack}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm leading-relaxed text-ink-soft">
                  <span className="text-xs font-semibold text-ink-lighter">주요 연계 과목</span>
                  <br />
                  {job.highSchoolSubjects.slice(0, 3).join(", ")}
                </p>
                <p className="text-sm leading-relaxed text-ink-soft">
                  <span className="text-xs font-semibold text-ink-lighter">졸업 후 진출</span>
                  <br />
                  {[job.name, ...job.relatedJobs.slice(0, 2)].join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 고교 학습 로드맵 타임라인 */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink sm:text-2xl">
            <Map className="h-5 w-5 text-primary-500" strokeWidth={2} />
            고등학교 3개년 추천 로드맵
          </h2>
        </div>
        <div className="space-y-0 pl-1">
          {roadmap.map((step, i) => (
            <div key={step.grade} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
                  {step.grade}
                </div>
                {i < roadmap.length - 1 && <div className="my-1.5 w-px flex-1 bg-line-strong" />}
              </div>
              <div className="flex-1 pb-8">
                <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap gap-1.5">
                    {step.subjects.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.activity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 수능 전략 박스 */}
      <section className="mt-8 rounded-xl border border-line bg-surface-50 p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
          <Target className="h-5 w-5 text-primary-500" strokeWidth={2} />
          수능 선택과목 대비 전략
        </h2>
        <p className="mt-3 text-sm font-bold text-ink">{exam.combo}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{exam.tip}</p>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-white p-6 shadow-sm">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" strokeWidth={2} />
        <p className="text-sm leading-relaxed text-ink-soft">
          학생만의 학년별 정교화된 개별 로드맵과 대내외 활동 추천은{" "}
          <Link href="/report" className="font-semibold text-primary-600 transition duration-200 hover:text-primary-700">
            AI 분석 보고서
          </Link>
          에서 한번에 확인하고 바로 인쇄할 수 있습니다.
        </p>
      </div>

      {/* 하단 액션 바 */}
      <div className="print-hidden pointer-events-none fixed inset-x-0 bottom-6 z-40">
        <div className="pointer-events-auto mx-auto flex max-w-xl justify-center gap-3 px-6">
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-line-strong bg-white px-5 py-3 text-sm font-bold text-ink shadow-md transition duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 active:scale-[0.98]"
          >
            <ChevronLeft className="h-4 w-4" />
            직업 상세
          </Link>
          <Link
            href={`/chat?job=${job.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line-strong bg-white px-5 py-3 text-sm font-bold text-ink shadow-md transition duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 active:scale-[0.98]"
          >
            <MessageSquare className="h-4 w-4" />
            AI 상담하기
          </Link>
          <Link
            href="/report"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            <FileText className="h-4 w-4" />
            AI 보고서 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
