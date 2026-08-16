import type { MetadataRoute } from "next";
import { getLogs } from "@/lib/logs";
import { getProjects } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

/** 검색엔진에 고정 페이지와 공개 콘텐츠 상세 주소를 알려주는 sitemap.xml을 생성합니다. */
export default function sitemap(): MetadataRoute.Sitemap {
  // 내용 파일이 필요 없는 고정 페이지 주소입니다.
  const fixed = ["", "/projects", "/log", "/about", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
  return [
    ...fixed,
    // updatedAt이 있으면 수정일을, 없으면 최초 작성일을 검색엔진에 전달합니다.
    ...getProjects().map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt ?? p.createdAt,
    })),
    ...getLogs().map((l) => ({
      url: `${SITE_URL}/log/${l.slug}`,
      lastModified: l.updatedAt ?? l.createdAt,
    })),
  ];
}
