import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 실제 콘텐츠에 외부 이미지가 필요해지면 사용하는 도메인만 정확히 추가합니다.
      // 예: { protocol: "https", hostname: "example-project.vercel.app" },
    ],
  },
};

export default nextConfig;
