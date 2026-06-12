import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "진로나침반 — 고등학생 맞춤형 AI 진로 상담",
  description:
    "커리어넷 진로심리검사 결과로 579개 직업 중 나에게 맞는 직업·전공·고교 선택과목을 추천받아 보세요.",
};

/** v3 브랜드 로고 — 나침반 라인 드로잉 (로즈 N극 + 슬레이트 S극 바늘) */
function CompassLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className={className}>
      <circle cx="14" cy="14" r="12.5" stroke="#26222B" strokeWidth="1.4" />
      <polygon points="14,14 19.6,8.4 13.1,14.9 14.9,13.1" fill="#D6456B" />
      <polygon points="14,14 8.4,19.6 14.9,13.1 13.1,14.9" fill="#3D3A52" />
      <circle cx="14" cy="14" r="1.6" fill="#FBF9F6" stroke="#26222B" strokeWidth="0.9" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface text-ink font-sans selection:bg-primary-100 selection:text-primary-900">
        <header className="print-hidden sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-[72px]">
            <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-80">
              <CompassLogo className="h-6 w-6 lg:h-7 lg:w-7" />
              <span className="font-serif text-[17px] font-bold tracking-[-0.01em] text-ink lg:text-[19px]">
                진로나침반
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-ink-soft sm:gap-9 lg:text-[15px]">
              <Link href="/results" className="transition hover:text-ink">
                추천 결과
              </Link>
              <Link href="/chat" className="transition hover:text-ink">
                AI 상담
              </Link>
              <Link href="/report" className="transition hover:text-ink">
                보고서
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="print-hidden border-t border-line bg-surface py-7 text-center text-xs font-medium text-ink-lighter">
          진로나침반 — 교육청 진로교육 지원 서비스 · 직업 정보 출처: 직업백과 · 개발4팀
        </footer>
      </body>
    </html>
  );
}
