import Link from "next/link";
import { Camera, PenTool, Target, GraduationCap, BookOpen, Compass, Award, Activity, Sparkles, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    iconColor: "text-pink-600 bg-pink-50",
    title: "맞춤 직업 추천",
    desc: "579개 직업 중 검사 결과와 성향에 딱 맞는 직업을 AI가 추천해 드려요.",
  },
  {
    icon: GraduationCap,
    iconColor: "text-violet-600 bg-violet-50",
    title: "전공·학과 안내",
    desc: "직업별 추천 학과와 계열, 진학 준비 방법까지 한 번에 알려드려요.",
  },
  {
    icon: BookOpen,
    iconColor: "text-fuchsia-600 bg-fuchsia-50",
    title: "고교 과목 가이드",
    desc: "지금 선택해야 할 고교 과목과 고1~3 학습 로드맵을 안내해 드려요.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-surface">
      {/* 히어로 섹션 배경 감성 광원 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[350px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-pink-300/20 via-violet-300/10 to-orange-200/20 blur-3xl opacity-80"></div>
      </div>

      {/* 히어로 */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-4 py-1.5 text-xs font-bold text-pink-600 border border-pink-100 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          AI 기반 여고생 맞춤 진로 가이드
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl leading-[1.15] break-keep-all">
          <span className="bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">나만의 진로</span>를<br className="sm:hidden" /> 찾아보세요
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          진로심리검사 결과지 사진 한 장이면 충분해요.
          <br className="hidden sm:block" />
          AI가 맞춤 직업·전공·공부 방법을 예쁘고 보기 편한 보고서로 작성해 드립니다.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/input/photo"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 text-base font-extrabold text-white shadow-lg shadow-pink-500/15 transition duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] sm:w-auto"
          >
            <Camera className="h-5 w-5" strokeWidth={2.2} />
            결과지 사진으로 시작하기
          </Link>
          <Link
            href="/input/quick"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white border border-pink-200 px-8 py-4 text-base font-extrabold text-pink-600 shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-pink-50/30 active:scale-[0.98] sm:w-auto"
          >
            <PenTool className="h-5 w-5" strokeWidth={2.2} />
            간편 입력으로 시작하기
          </Link>
        </div>
        <p className="mt-5 text-xs font-semibold text-slate-400">
          검사를 아직 안 받았어도 괜찮아요 — 좋아하는 것만 입력하면 AI가 매칭해 드려요.
        </p>
      </section>

      {/* 특징 카드 */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="double-bezel transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-200/30">
              <div className="double-bezel-inner p-6 h-full flex flex-col items-start">
                <div className={`p-3.5 rounded-2xl ${f.iconColor}`}>
                  <f.icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h2 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 통계 배너 */}
      <section className="relative z-10 border-y border-pink-100/50 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-pink-50/50 px-6 py-10 text-center">
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-pink-500 sm:text-4xl">579개</div>
            <div className="mt-1.5 text-xs font-bold text-slate-400 sm:text-sm">직업 데이터</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-violet-500 sm:text-4xl">11개</div>
            <div className="mt-1.5 text-xs font-bold text-slate-400 sm:text-sm">직업 분야</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-fuchsia-500 sm:text-4xl">AI</div>
            <div className="mt-1.5 text-xs font-bold text-slate-400 sm:text-sm">맞춤 분석 보고서</div>
          </div>
        </div>
      </section>

      {/* 이용 순서 */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">이렇게 진행돼요</h2>
        <p className="text-center text-sm font-semibold text-slate-400 mt-2">단 몇 단계만으로 전문적인 진로 로드맵을 완성해 보세요</p>
        
        <ol className="mt-10 grid gap-5 sm:grid-cols-4">
          {([
            ["1", "검사 결과지 업로드 또는 간편 입력", Camera],
            ["2", "AI가 나의 흥미·적성 분석", Compass],
            ["3", "맞춤 직업 Top 10 추천", Award],
            ["4", "학습 로드맵 보고서 받기", Activity],
          ] as const).map(([n, label, Icon]) => (
            <li
              key={n}
              className="flex items-center gap-4 rounded-2xl border border-pink-100/50 bg-white p-5 shadow-sm shadow-pink-100/30 sm:flex-col sm:py-8 sm:text-center"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                  {n}
                </span>
                {Icon && typeof Icon !== "string" && <Icon className="h-5 w-5" strokeWidth={2.2} />}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
