import Link from "next/link";
import { Camera, PenLine, Briefcase, GraduationCap, BookOpen, Compass, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    icon: Briefcase,
    no: "01",
    title: "맞춤 직업 추천",
    desc: "579개 직업 데이터에서 나의 흥미·적성에 꼭 맞는 직업 Top 10을 골라 드려요.",
  },
  {
    icon: GraduationCap,
    no: "02",
    title: "전공·학과 안내",
    desc: "추천 직업으로 이어지는 대학 전공과 학과 정보를 한눈에 정리해 드려요.",
  },
  {
    icon: BookOpen,
    no: "03",
    title: "고교 과목 가이드",
    desc: "고1부터 고3까지, 학년별로 들으면 좋은 선택과목을 로드맵으로 알려 드려요.",
  },
] as const;

const STEPS = [
  ["결과지 업로드", "결과지 사진 또는 간편 입력으로 시작해요"],
  ["AI 분석", "AI가 나의 흥미와 적성을 분석해요"],
  ["직업 Top 10 추천", "나에게 맞는 직업 10개를 추천받아요"],
  ["로드맵 보고서", "인쇄 가능한 학습 로드맵 보고서를 받아요"],
] as const;

/** 히어로 배지의 미니 나침반 아이콘 */
function MiniCompass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className={className}>
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" />
      <polygon points="14,14 19.6,8.4 13.1,14.9 14.9,13.1" fill="currentColor" />
    </svg>
  );
}

/** 나침반 라인 드로잉 — 데스크톱 히어로 (시안 480px 원본) */
function CompassIllustration() {
  return (
    <svg width="480" height="480" viewBox="0 0 480 480" fill="none" aria-hidden="true" className="h-auto w-full max-w-[480px]">
      <circle cx="240" cy="240" r="228" stroke="#3D3A52" strokeOpacity="0.22" strokeWidth="1" />
      <circle
        cx="240" cy="240" r="218" stroke="#3D3A52" strokeOpacity="0.5" strokeWidth="9"
        strokeDasharray="1 13" className="compass-spin" style={{ transformOrigin: "240px 240px" }}
      />
      <circle
        cx="240" cy="240" r="168" stroke="#3D3A52" strokeOpacity="0.28" strokeWidth="1"
        strokeDasharray="3 6" className="compass-spin-rev" style={{ transformOrigin: "240px 240px" }}
      />
      <circle cx="240" cy="240" r="108" stroke="#3D3A52" strokeOpacity="0.18" strokeWidth="1" />
      <line x1="240" y1="36" x2="240" y2="444" stroke="#3D3A52" strokeOpacity="0.12" strokeWidth="1" />
      <line x1="36" y1="240" x2="444" y2="240" stroke="#3D3A52" strokeOpacity="0.12" strokeWidth="1" />
      <text x="240" y="24" textAnchor="middle" fontFamily="Noto Serif KR, serif" fontSize="15" fontWeight="600" fill="#26222B">N</text>
      <text x="462" y="245" textAnchor="middle" fontFamily="Noto Serif KR, serif" fontSize="14" fill="#97919E">E</text>
      <text x="240" y="472" textAnchor="middle" fontFamily="Noto Serif KR, serif" fontSize="14" fill="#97919E">S</text>
      <text x="18" y="245" textAnchor="middle" fontFamily="Noto Serif KR, serif" fontSize="14" fill="#97919E">W</text>
      <polyline points="118,108 158,140 196,112 224,150" stroke="#3D3A52" strokeOpacity="0.32" strokeWidth="0.8" />
      <circle cx="118" cy="108" r="2.6" fill="#3D3A52" />
      <circle cx="158" cy="140" r="2.6" fill="#D6456B" className="star-twinkle-a" />
      <circle cx="196" cy="112" r="2.6" fill="#3D3A52" />
      <circle cx="224" cy="150" r="3.2" fill="#D6456B" className="star-twinkle-b" />
      <polyline points="306,330 338,360 372,338" stroke="#3D3A52" strokeOpacity="0.32" strokeWidth="0.8" />
      <circle cx="306" cy="330" r="2.6" fill="#3D3A52" />
      <circle cx="338" cy="360" r="2.6" fill="#D6456B" className="star-twinkle-c" />
      <circle cx="372" cy="338" r="2.6" fill="#3D3A52" />
      <g className="compass-seek" style={{ transformOrigin: "240px 240px" }}>
        <polygon points="344,136 250,250 230,230" fill="#D6456B" />
        <polygon points="344,136 250,250 240,240" fill="#A93553" fillOpacity="0.55" />
        <polygon points="136,344 230,230 250,250" fill="#3D3A52" />
      </g>
      <circle cx="240" cy="240" r="11" stroke="#26222B" strokeWidth="1.2" fill="#FBF9F6" />
      <circle cx="240" cy="240" r="3.5" fill="#26222B" />
    </svg>
  );
}

/** 나침반 라인 드로잉 — 모바일 히어로 (굵은 스트로크 간소화 버전) */
function CompassIllustrationMobile() {
  return (
    <svg width="232" height="232" viewBox="0 0 480 480" fill="none" aria-hidden="true">
      <circle cx="240" cy="240" r="228" stroke="#3D3A52" strokeOpacity="0.22" strokeWidth="1.6" />
      <circle
        cx="240" cy="240" r="214" stroke="#3D3A52" strokeOpacity="0.5" strokeWidth="13"
        strokeDasharray="1.5 19" className="compass-spin" style={{ transformOrigin: "240px 240px" }}
      />
      <circle
        cx="240" cy="240" r="160" stroke="#3D3A52" strokeOpacity="0.28" strokeWidth="1.6"
        strokeDasharray="5 9" className="compass-spin-rev" style={{ transformOrigin: "240px 240px" }}
      />
      <line x1="240" y1="46" x2="240" y2="434" stroke="#3D3A52" strokeOpacity="0.12" strokeWidth="1.6" />
      <line x1="46" y1="240" x2="434" y2="240" stroke="#3D3A52" strokeOpacity="0.12" strokeWidth="1.6" />
      <polyline points="118,118 162,148 204,118" stroke="#3D3A52" strokeOpacity="0.32" strokeWidth="1.4" />
      <circle cx="118" cy="118" r="4.5" fill="#3D3A52" />
      <circle cx="162" cy="148" r="4.5" fill="#D6456B" className="star-twinkle-a" />
      <circle cx="204" cy="118" r="4.5" fill="#3D3A52" />
      <g className="compass-seek" style={{ transformOrigin: "240px 240px" }}>
        <polygon points="344,136 250,250 230,230" fill="#D6456B" />
        <polygon points="136,344 230,230 250,250" fill="#3D3A52" />
      </g>
      <circle cx="240" cy="240" r="16" stroke="#26222B" strokeWidth="2" fill="#FBF9F6" />
      <circle cx="240" cy="240" r="5.5" fill="#26222B" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="bg-surface">
      {/* 히어로 */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-14 pt-11 lg:grid-cols-[1fr_520px] lg:gap-16 lg:pb-24 lg:pt-22">
        <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:gap-7 lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-2 text-[13px] font-semibold tracking-[0.02em] text-primary-900">
            <MiniCompass className="h-3.5 w-3.5 text-primary-900" />
            AI 기반 맞춤 진로 가이드
          </span>
          <h1 className="font-serif text-4xl font-bold leading-[1.32] tracking-[-0.015em] text-ink sm:text-5xl lg:text-6xl lg:leading-[1.28]">
            나만의 <span className="text-primary-500">진로</span>를
            <br />
            찾아보세요
          </h1>
          <p className="max-w-md text-[15px] leading-[1.7] text-ink-soft lg:max-w-[480px] lg:text-lg">
            진로심리검사 결과지 사진 한 장이면 충분해요. 579개 직업 데이터에서 나에게 맞는 직업과 전공, 고교
            선택과목까지 안내해 드려요.
          </p>

          <div className="my-1 lg:hidden">
            <CompassIllustrationMobile />
          </div>

          <div className="flex w-full flex-col items-center gap-2.5 sm:w-auto sm:flex-row sm:gap-3.5 lg:mt-2">
            <Link
              href="/input/photo"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary-500 px-7 py-4 text-base font-bold text-white shadow-[0_2px_8px_rgba(214,69,107,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-[0_6px_16px_rgba(214,69,107,0.32)] active:translate-y-0 sm:w-auto"
            >
              <Camera className="h-[19px] w-[19px]" strokeWidth={2} />
              결과지 사진으로 시작하기
            </Link>
            <Link
              href="/input/quick"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-line-strong bg-white px-7 py-4 text-base font-semibold text-secondary-500 transition duration-200 hover:-translate-y-0.5 hover:border-secondary-500 active:translate-y-0 sm:w-auto"
            >
              <PenLine className="h-[18px] w-[18px]" strokeWidth={2} />
              간편 입력으로 시작하기
            </Link>
          </div>
          <p className="text-[13px] text-ink-lighter lg:text-sm">
            검사를 아직 안 받았어도 괜찮아요 — 5개의 질문이면 충분해요.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-500 transition duration-200 hover:text-primary-600"
          >
            <Compass className="h-4 w-4" strokeWidth={2} />
            아니면 어떤 직업들이 있나 둘러보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="hidden justify-center lg:flex">
          <CompassIllustration />
        </div>
      </section>

      {/* 특징 카드 3장 */}
      <section className="mx-auto flex max-w-6xl flex-col gap-5 px-6 pb-12 sm:gap-9 lg:pb-22">
        <div className="flex flex-col gap-2 sm:gap-2.5">
          <span className="text-xs font-bold tracking-[0.14em] text-primary-500 sm:text-[13px]">핵심 기능</span>
          <h2 className="font-serif text-2xl font-bold tracking-[-0.01em] text-ink sm:text-[34px]">
            진로 탐색에 필요한 전부
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.no}
              className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 transition duration-300 sm:flex-col sm:gap-[18px] sm:rounded-[18px] sm:p-8 sm:hover:-translate-y-[3px] sm:hover:shadow-lg"
            >
              <div className="flex shrink-0 items-start pt-0.5 sm:w-full sm:items-center sm:justify-between sm:pt-0">
                <f.icon className="h-6 w-6 text-primary-500 sm:h-7 sm:w-7" strokeWidth={1.8} />
                <span className="hidden font-serif text-[15px] italic text-primary-200 sm:block">{f.no}</span>
              </div>
              <div className="flex flex-col gap-1.5 sm:gap-2.5">
                <h3 className="font-serif text-[17px] font-bold text-ink sm:text-[21px]">{f.title}</h3>
                <p className="text-sm leading-[1.65] text-ink-soft sm:text-[15px]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 통계 배너 */}
      <section className="bg-secondary-600">
        <div className="mx-auto grid max-w-6xl grid-cols-3 px-5 py-8 lg:px-6 lg:py-16">
          <div className="flex flex-col items-center gap-1.5 border-r border-white/15 px-3 lg:gap-2 lg:px-6">
            <span className="font-serif text-[28px] font-bold leading-none text-white lg:text-[52px]">579</span>
            <span className="text-xs tracking-[0.04em] text-secondary-300 lg:text-[15px]">개 직업 데이터</span>
          </div>
          <Link
            href="/jobs"
            className="group flex flex-col items-center gap-1.5 border-r border-white/15 px-3 transition hover:opacity-100 lg:gap-2 lg:px-6"
          >
            <span className="font-serif text-[28px] font-bold leading-none text-white lg:text-[52px]">11</span>
            <span className="inline-flex items-center gap-1 text-xs tracking-[0.04em] text-secondary-300 transition group-hover:text-white lg:text-[15px]">
              개 직업 분야
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
          <div className="flex flex-col items-center gap-1.5 px-3 lg:gap-2 lg:px-6">
            <span className="font-serif text-[28px] font-bold leading-none text-primary-300 lg:text-[52px]">AI</span>
            <span className="text-xs tracking-[0.04em] text-secondary-300 lg:text-[15px]">맞춤 분석 보고서</span>
          </div>
        </div>
      </section>

      {/* 이용 순서 4단계 */}
      <section className="mx-auto flex max-w-6xl flex-col gap-7 px-6 py-12 sm:gap-12 lg:py-22">
        <div className="flex flex-col gap-2 sm:items-center sm:gap-2.5">
          <span className="text-xs font-bold tracking-[0.14em] text-primary-500 sm:text-[13px]">이용 순서</span>
          <h2 className="font-serif text-2xl font-bold tracking-[-0.01em] text-ink sm:text-[34px]">
            네 단계면 충분해요
          </h2>
        </div>
        <ol className="relative grid gap-6 sm:grid-cols-4 sm:gap-6">
          {/* 연결 점선 — 데스크톱 가로 / 모바일 세로 */}
          <div
            aria-hidden
            className="absolute left-[110px] right-[110px] top-[26px] hidden border-t-[1.5px] border-dashed border-line-strong sm:block"
          />
          <div
            aria-hidden
            className="absolute bottom-3 left-[21px] top-3 border-l-[1.5px] border-dashed border-line-strong sm:hidden"
          />
          {STEPS.map(([title, desc], i) => (
            <li
              key={title}
              className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:gap-4 sm:text-center"
            >
              <div
                className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border-[1.5px] bg-surface font-serif text-[17px] font-bold sm:h-[52px] sm:w-[52px] sm:text-xl ${
                  i === 0 ? "border-primary-500 text-primary-500" : "border-line-strong text-secondary-500"
                }`}
              >
                {i + 1}
              </div>
              <div className="flex flex-col gap-1 pt-0.5 sm:gap-1.5 sm:pt-0">
                <span className="text-base font-bold text-ink sm:text-[17px]">{title}</span>
                <span className="max-w-[200px] text-[13.5px] leading-[1.6] text-ink-soft sm:text-sm">{desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
