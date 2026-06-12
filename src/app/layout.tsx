import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

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
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="print-hidden sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-ink">
              <span className="text-xl">🧭</span>
              <span className="text-lg">진로나침반</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-ink-soft">
              <Link href="/results" className="hover:text-primary">
                추천 결과
              </Link>
              <Link href="/chat" className="hover:text-primary">
                AI 상담
              </Link>
              <Link href="/report" className="hover:text-primary">
                보고서
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="print-hidden border-t border-slate-200 bg-white py-6 text-center text-sm text-ink-soft">
          진로나침반 · 직업백과 579개 직업 데이터 기반 AI 진로 탐색 · 개발4팀
        </footer>
      </body>
    </html>
  );
}
