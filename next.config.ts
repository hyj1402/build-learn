import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // next/image는 보안을 위해 등록된 외부 주소만 최적화합니다. 현재 이미지는 모두 public 폴더에 있습니다.
      // 실제 콘텐츠에 외부 이미지가 필요해지면 사용하는 도메인만 정확히 추가합니다.
      // 예: { protocol: "https", hostname: "example-project.vercel.app" },
    ],
  },
};

export default nextConfig;
