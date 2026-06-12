import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "진로나침반 — 고등학생 맞춤형 AI 진로 상담",
  description:
    "커리어넷 진로심리검사 결과로 579개 직업 중 나에게 맞는 직업·전공·고교 선택과목을 추천받아 보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface text-ink font-sans selection:bg-primary-100 selection:text-primary-900">
        <header className="print-hidden sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
              <Compass className="h-5 w-5 text-primary-500" strokeWidth={2.2} />
              <span className="text-lg font-extrabold tracking-tight text-ink">진로나침반</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-semibold text-ink-soft">
              <Link href="/results" className="transition hover:text-primary-600">
                추천 결과
              </Link>
              <Link href="/chat" className="transition hover:text-primary-600">
                AI 상담
              </Link>
              <Link href="/report" className="transition hover:text-primary-600">
                보고서
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="print-hidden border-t border-line bg-white py-8 text-center text-xs font-medium text-ink-lighter">
          진로나침반 · 직업백과 579개 직업 데이터 기반 AI 진로 탐색 · 개발4팀
        </footer>
      </body>
    </html>
  );
}
