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
      <body className="min-h-full flex flex-col bg-surface text-ink font-sans selection:bg-pink-100 selection:text-pink-900">
        <header className="print-hidden sticky top-0 z-40 border-b border-pink-100/50 bg-white/70 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-80">
              <Compass className="h-5.5 w-5.5 text-pink-500" strokeWidth={2.2} />
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
                진로나침반
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-bold text-slate-500">
              <Link href="/results" className="transition hover:text-pink-500">
                추천 결과
              </Link>
              <Link href="/chat" className="transition hover:text-pink-500">
                AI 상담
              </Link>
              <Link href="/report" className="transition hover:text-pink-500">
                보고서
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="print-hidden border-t border-pink-100/30 bg-white py-8 text-center text-xs font-semibold text-slate-400">
          진로나침반 · 직업백과 579개 직업 데이터 기반 AI 진로 탐색 · 개발4팀
        </footer>
      </body>
    </html>
  );
}
