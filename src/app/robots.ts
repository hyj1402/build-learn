import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** 모든 검색 로봇의 접근을 허용하고 sitemap 위치를 알려주는 robots.txt를 생성합니다. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
