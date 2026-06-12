import Link from "next/link";
import { Camera, PenTool, Target, GraduationCap, BookOpen, Compass, Award, Activity, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "맞춤 직업 추천",
    desc: "579개 직업 중 검사 결과와 성향에 딱 맞는 직업을 AI가 추천해 드려요.",
  },
  {
    icon: GraduationCap,
    title: "전공·학과 안내",
    desc: "직업별 추천 학과와 계열, 진학 준비 방법까지 한 번에 알려드려요.",
  },
  {
    icon: BookOpen,
    title: "고교 과목 가이드",
    desc: "지금 선택해야 할 고교 과목과 고1~3 학습 로드맵을 안내해 드려요.",
  },
];

const STEPS = [
  ["1", "검사 결과지 업로드 또는 간편 입력", Camera],
  ["2", "AI가 나의 흥미·적성 분석", Compass],
  ["3", "맞춤 직업 Top 10 추천", Award],
  ["4", "학습 로드맵 보고서 받기", Activity],
] as const;

export default function Home() {
  return (
    <div className="bg-surface">
      {/* 히어로 */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI 기반 여고생 맞춤 진로 가이드
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink leading-[1.15] sm:text-5xl">
          <span className="text-primary-600">나만의 진로</span>를<br className="sm:hidden" /> 찾아보세요
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
          진로심리검사 결과지 사진 한 장이면 충분해요.
          <br className="hidden sm:block" />
          AI가 맞춤 직업·전공·공부 방법을 보기 편한 보고서로 작성해 드립니다.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/input/photo"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-8 py-4 text-base font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98] sm:w-auto"
          >
            <Camera className="h-5 w-5" strokeWidth={2.2} />
            결과지 사진으로 시작하기
          </Link>
          <Link
            href="/input/quick"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-8 py-4 text-base font-bold text-ink shadow-xs transition duration-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 active:scale-[0.98] sm:w-auto"
          >
            <PenTool className="h-5 w-5" strokeWidth={2.2} />
            간편 입력으로 시작하기
          </Link>
        </div>
        <p className="mt-5 text-xs font-medium text-ink-lighter">
          검사를 아직 안 받았어도 괜찮아요 — 좋아하는 것만 입력하면 AI가 매칭해 드려요.
        </p>
      </section>

      {/* 특징 카드 */}
      <section className="mx-auto max-w-5xl px-6 pb-12 sm:pb-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-line bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <f.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-ink">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 통계 배너 */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-line px-6 py-10 text-center">
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-primary-600 sm:text-4xl">579개</div>
            <div className="mt-1.5 text-xs font-semibold text-ink-lighter sm:text-sm">직업 데이터</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-primary-600 sm:text-4xl">11개</div>
            <div className="mt-1.5 text-xs font-semibold text-ink-lighter sm:text-sm">직업 분야</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-primary-600 sm:text-4xl">AI</div>
            <div className="mt-1.5 text-xs font-semibold text-ink-lighter sm:text-sm">맞춤 분석 보고서</div>
          </div>
        </div>
      </section>

      {/* 이용 순서 */}
      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">이렇게 진행돼요</h2>
          <p className="mt-2 text-sm text-ink-lighter">단 네 단계로 나만의 진로 로드맵을 완성해 보세요</p>
        </div>

        <ol className="grid gap-5 sm:grid-cols-4">
          {STEPS.map(([n, label, Icon]) => (
            <li
              key={n}
              className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 shadow-sm sm:flex-col sm:py-8 sm:text-center"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {n}
                </span>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold leading-relaxed text-ink">{label}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
