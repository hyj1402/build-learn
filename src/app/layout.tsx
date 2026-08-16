import type { Metadata } from "next";
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE_URL } from "@/lib/site";
import "@/styles/globals.css";

// next/font는 폰트를 빌드 시 최적화하고 CSS 변수 이름으로 전역 스타일에 전달합니다.
const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

// 루트 metadata는 모든 페이지가 상속하는 기본 SEO·공유 정보를 정의합니다.
export const metadata: Metadata = {
  // 상대 이미지 경로(/og-default.png)를 완전한 URL로 바꾸는 기준 주소입니다.
  metadataBase: new URL(SITE_URL),
  title: { default: "BUILD & LEARN", template: "%s | BUILD & LEARN" },
  description: "만들고 배우고, 그 과정을 기록하는 개인 개발 아카이브",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "BUILD & LEARN",
    title: "BUILD & LEARN",
    description: "만들고 배우고, 그 과정을 기록하는 개인 개발 아카이브",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "BUILD & LEARN — Making, learning, recording.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BUILD & LEARN",
    description: "만들고 배우고, 그 과정을 기록하는 개인 개발 아카이브",
    images: ["/og-default.png"],
  },
};

/** App Router의 최상위 틀입니다. 모든 페이지가 Header와 Footer 사이의 children 위치에 들어옵니다. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        {/* 키보드 사용자가 반복 메뉴를 건너뛰고 본문으로 바로 이동하는 접근성 링크입니다. */}
        <a className="skip-link" href="#main-content">
          본문으로 바로가기
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
