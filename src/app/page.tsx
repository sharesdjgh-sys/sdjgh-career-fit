import Link from "next/link";

const FEATURES = [
  {
    icon: "🎯",
    title: "맞춤 직업 추천",
    desc: "579개 직업 중 검사 결과와 성향에 딱 맞는 직업을 AI가 추천해 드려요.",
  },
  {
    icon: "🎓",
    title: "전공·학과 안내",
    desc: "직업별 추천 학과와 계열, 진학 준비 방법까지 한 번에 알려드려요.",
  },
  {
    icon: "📚",
    title: "고교 과목 가이드",
    desc: "지금 선택해야 할 고교 과목과 고1~3 학습 로드맵을 안내해 드려요.",
  },
];

export default function Home() {
  return (
    <div>
      {/* 히어로 */}
      <section className="bg-gradient-to-br from-primary via-blue-500 to-blue-400 text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-3xl font-black leading-snug sm:text-5xl">
            나만의 진로를 찾아보세요
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-blue-100 sm:text-lg">
            진로심리검사 결과지 사진 한 장이면 충분해요.
            <br className="hidden sm:block" />
            AI가 맞춤 직업·전공·공부 방법을 보고서로 만들어 드립니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/input/photo"
              className="w-full rounded-btn bg-white px-8 py-3.5 text-base font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              📷 검사 결과지 사진으로 시작하기
            </Link>
            <Link
              href="/input/quick"
              className="w-full rounded-btn bg-secondary px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-xl sm:w-auto"
            >
              ✏️ 간편 입력으로 시작하기
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-100">
            검사를 아직 안 받았어도 괜찮아요 — 좋아하는 것만 알려주면 AI가 찾아드려요.
          </p>
        </div>
      </section>

      {/* 특징 카드 */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-card border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">{f.icon}</div>
              <h2 className="mt-3 text-lg font-bold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 통계 배너 */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-slate-200 px-4 py-8 text-center">
          <div>
            <div className="text-2xl font-black text-primary sm:text-3xl">579개</div>
            <div className="mt-1 text-xs text-ink-soft sm:text-sm">직업 데이터</div>
          </div>
          <div>
            <div className="text-2xl font-black text-secondary sm:text-3xl">11개</div>
            <div className="mt-1 text-xs text-ink-soft sm:text-sm">직업 분야</div>
          </div>
          <div>
            <div className="text-2xl font-black text-accent sm:text-3xl">AI</div>
            <div className="mt-1 text-xs text-ink-soft sm:text-sm">맞춤 분석 보고서</div>
          </div>
        </div>
      </section>

      {/* 이용 순서 */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">이렇게 진행돼요</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            ["1", "검사 결과지 촬영 또는 간편 입력"],
            ["2", "AI가 나의 흥미·적성 분석"],
            ["3", "맞춤 직업 Top 10 추천"],
            ["4", "학습 로드맵 보고서 받기"],
          ].map(([n, label]) => (
            <li
              key={n}
              className="flex items-center gap-3 rounded-card bg-white p-4 shadow-sm sm:flex-col sm:py-6 sm:text-center"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light font-bold text-primary">
                {n}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
