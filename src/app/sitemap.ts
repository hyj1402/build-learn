import type { MetadataRoute } from "next";
import { getLogs } from "@/lib/logs";
import { getProjects } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/projects", "/log", "/about", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
  return [
    ...fixed,
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
