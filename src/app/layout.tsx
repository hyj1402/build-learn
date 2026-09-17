import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Space_Grotesk } from "next/font/google";
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

// 긴 Log 본문에만 명조 계열을 적용해 제목·메뉴와 구분되는 편안한 읽기 리듬을 만듭니다.
const readingFont = Noto_Serif_KR({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-reading",
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

// 사람이 테마 버튼으로 라이트/다크를 직접 골랐다면, 그 값을 화면이 그려지기 전에 <html>에 반영합니다.
// React가 켜지기 전에 실행되는 순수 스크립트라서, 이게 없으면 항상 라이트로 먼저 그려졌다가
// 다크로 바뀌는 깜빡임(FOUC)이 생깁니다. 선택하지 않았다면(null) 아무것도 하지 않고
// globals.css의 @media (prefers-color-scheme: dark)가 OS 설정을 그대로 따릅니다.
const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (e) {}
})();
`;

/**
 * 문서 전체의 최상위 틀입니다. html/body와 폰트·전역 CSS만 담당합니다.
 * 공개 사이트의 Header/Footer는 여기가 아니라 `(site)` 그룹 레이아웃에 있습니다.
 * 관리자 화면(/admin)은 그 그룹 밖에 있어서 공개 사이트 메뉴를 물려받지 않고 자체 레이아웃만 사용합니다.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${displayFont.variable} ${bodyFont.variable} ${readingFont.variable}`}
      data-scroll-behavior="smooth"
      // 위 인라인 스크립트가 hydration 전에 data-theme을 붙이기 때문에 서버 HTML과 값이 달라집니다.
      // 의도한 차이라서, React가 이 속성 하나에 대해 불필요한 경고를 띄우지 않게 합니다.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
