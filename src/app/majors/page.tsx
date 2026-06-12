import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/jobs";
import type { CollegeTrack } from "@/lib/types";
import {
  GraduationCap,
  Map,
  Target,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  FileText,
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
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-xl font-extrabold text-slate-900">직업을 먼저 선택해 주세요</h1>
        <p className="mt-2 text-sm text-slate-400">
          추천 결과에서 관심 있는 직업을 고르면 전공과 학습 로드맵 정보를 확인할 수 있습니다.
        </p>
        <Link
          href="/results"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-3 text-sm font-bold text-white shadow-md shadow-pink-500/10 transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          추천 결과 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const job = getJob(jobId);
  if (!job) notFound();

  const roadmap = buildRoadmap(job.highSchoolSubjects, job.collegeTrack);
  const exam = EXAM_STRATEGY[job.collegeTrack];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 pb-32">
      <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-pink-500 transition mb-4">
        <ChevronLeft className="h-4 w-4" />
        직업 정보로 돌아가기
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{job.name} 전공·학습 로드맵</h1>
      
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pink-50 border border-pink-100/60 px-3.5 py-1 text-xs font-semibold text-pink-600">
        <Sparkles className="h-3.5 w-3.5" />
        추천 계열: {job.collegeTrack}
      </div>

      {/* 추천 학과 카드 */}
      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <GraduationCap className="h-5.5 w-5.5 text-pink-500" />
          추천 학과 (우선순위순)
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {job.majors.map((m, i) => (
            <div key={m} className="double-bezel">
              <div className="double-bezel-inner p-6 shadow-sm h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-800 text-base">
                      {i + 1}. {m}
                    </h3>
                    <span className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                      {job.collegeTrack}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <p className="text-xs leading-relaxed text-slate-400 font-semibold">
                      주요 연계 과목: <span className="text-slate-600 font-bold">{job.highSchoolSubjects.slice(0, 3).join(", ")}</span>
                    </p>
                    <p className="text-xs leading-relaxed text-slate-400 font-semibold">
                      졸업 후 진출: <span className="text-slate-600 font-bold">{[job.name, ...job.relatedJobs.slice(0, 2)].join(", ")}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 고교 학습 로드맵 타임라인 */}
      <section className="mt-12">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Map className="h-5 w-5 text-indigo-500" />
          고등학교 3개년 추천 로드맵
        </h2>
        <div className="mt-6 space-y-0 pl-1">
          {roadmap.map((step, i) => (
            <div key={step.grade} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500 text-sm font-extrabold text-white shadow-md shadow-pink-500/10">
                  {step.grade}
                </div>
                {i < roadmap.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1.5" />}
              </div>
              <div className="flex-1 pb-8">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap gap-1.5">
                    {step.subjects.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-pink-50 bg-pink-50/50 px-3 py-1 text-xs font-bold text-pink-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">{step.activity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 수능 전략 박스 */}
      <section className="mt-8 rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
        <h2 className="text-base font-extrabold text-amber-800 flex items-center gap-1.5">
          <Target className="h-5 w-5 text-amber-600" />
          수능 선택과목 대비 전략
        </h2>
        <p className="mt-3 text-sm font-extrabold text-slate-800">{exam.combo}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500 font-medium">{exam.tip}</p>
      </section>

      <div className="mt-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 p-6 text-sm leading-relaxed text-slate-500 font-medium">
        💡 학생만의 학년별 정교화된 개별 로드맵과 대내외 활동 추천은{" "}
        <Link href="/report" className="font-extrabold text-pink-500 hover:underline">
          AI 분석 보고서
        </Link>
        에서 한번에 확인하고 바로 인쇄할 수 있습니다.
      </div>

      {/* 하단 액션 바 */}
      <div className="print-hidden fixed inset-x-0 bottom-6 z-40 pointer-events-none">
        <div className="mx-auto flex max-w-xl justify-center gap-3 px-6 pointer-events-auto">
          <Link
            href={`/jobs/${job.id}`}
            className="rounded-full border border-slate-200 bg-white/95 backdrop-blur px-5 py-3.5 text-center text-xs font-bold text-slate-500 shadow-lg shadow-slate-900/5 transition duration-200 hover:bg-slate-50 hover:text-slate-700 active:scale-95 flex items-center justify-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            직업 상세
          </Link>
          <Link
            href={`/chat?job=${job.id}`}
            className="flex-1 rounded-full border border-pink-200/80 bg-white/95 backdrop-blur px-5 py-3.5 text-center text-xs font-bold text-pink-500 shadow-lg shadow-pink-200/5 transition duration-200 hover:scale-[1.02] hover:bg-pink-50 active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            AI 상담하기
          </Link>
          <Link
            href="/report"
            className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3.5 text-center text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <FileText className="h-4 w-4" />
            AI 보고서 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
