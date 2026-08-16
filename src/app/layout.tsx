import type { Metadata } from "next";
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE_URL } from "@/lib/site";
import "@/styles/globals.css";

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

export const metadata: Metadata = {
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
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
