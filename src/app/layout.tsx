import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

// 배포 도메인 (미정 시 Vercel 도메인 → localhost 순으로 폴백)
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const title = "진로나침반 — 고등학생 맞춤형 AI 진로 상담";
const description =
  "커리어넷 진로심리검사 결과로 579개 직업 중 나에게 맞는 직업·전공·고교 선택과목을 추천받아 보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "진로나침반",
  appleWebApp: { capable: true, title: "진로나침반", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "진로나침반",
    title,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "진로나침반" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#D6456B",
};

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
              <Image
                src="/logo2.png"
                alt="진로나침반 로고"
                width={327}
                height={283}
                priority
                className="h-7 w-auto lg:h-8"
              />
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
