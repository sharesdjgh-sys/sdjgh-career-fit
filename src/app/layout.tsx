import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

// 배포 도메인 (정식 주소 고정, 필요 시 NEXT_PUBLIC_SITE_URL로 덮어쓰기)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sdjgh-career-fit.vercel.app";

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
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "930x930" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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
        <footer className="print-hidden border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-10 lg:py-12">
            {/* 브랜드 + 소개 문구 */}
            <div className="flex max-w-2xl flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Image src="/logo2.png" alt="" width={327} height={283} className="h-6 w-auto" />
                <span className="font-serif text-[17px] font-bold tracking-[-0.01em] text-ink">
                  진로나침반
                </span>
              </div>
              <p className="font-serif text-lg leading-[1.6] text-ink sm:text-xl">
                진로의 답은 밖이 아니라, <span className="text-primary-500">내</span> 안에 있습니다.
              </p>
              <p className="text-sm leading-[1.75] text-ink-soft">
                흥미와 적성을 나침반 삼아, 스스로 길을 찾는 힘을 길러 드립니다.
              </p>
            </div>

            {/* 운영 · 출처 · 저작권 */}
            <div className="mt-8 flex flex-col gap-2.5 border-t border-line pt-6 text-xs leading-relaxed text-ink-lighter sm:flex-row sm:items-center sm:justify-between">
              <p>
                <span className="font-semibold text-ink-soft">서대전여자고등학교 진로상담실</span> 운영
                · 재학생 누구나 자유롭게 이용할 수 있어요
              </p>
              <p>© 2026 진로나침반 · 직업 정보 출처: 커리어넷 직업백과</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
