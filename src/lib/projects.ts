import { readContentFile, readContentFiles } from "@/lib/mdx";
import type { Project, ProjectFilter } from "@/types/project";

/** MDX의 자유로운 frontmatter 데이터를 앱에서 사용하는 Project 타입으로 정리합니다. */
function toProject(item: ReturnType<typeof readContentFiles>[number]): Project {
  return {
    slug: item.slug,
    title: String(item.data.title),
    summary: String(item.data.summary),
    thumbnailImage: String(item.data.thumbnailImage ?? ""),
    category: item.data.category,
    status: item.data.status,
    techStack: item.data.techStack ?? [],
    period: item.data.period ?? { start: "" },
    githubUrl: item.data.githubUrl,
    demoType: item.data.demoType,
    demoUrl: item.data.demoUrl,
    downloadUrl: item.data.downloadUrl,
    isPublished: Boolean(item.data.isPublished),
    isFeatured: Boolean(item.data.isFeatured),
    // MDX 기반 레거시 경로는 조회수를 추적하지 않으므로 0으로 둡니다.
    viewCount: 0,
    createdAt: String(item.data.createdAt),
    updatedAt: item.data.updatedAt,
    content: item.content,
  };
}

/**
 * 공개 프로젝트를 가져온 뒤 카테고리, Featured 여부, 검색어를 모두 함께 적용합니다.
 * 검색 대상은 제목·요약·기술 스택이며 최신 날짜가 먼저 오도록 정렬합니다.
 */
export function getProjects(filter: ProjectFilter = {}): Project[] {
  const q = filter.query?.toLowerCase();
  return readContentFiles("projects")
    .map(toProject)
    .filter((p) => p.isPublished)
    .filter((p) => !filter.category || p.category === filter.category)
    .filter((p) => filter.featured === undefined || p.isFeatured === filter.featured)
    .filter(
      (p) => !q || `${p.title} ${p.summary} ${p.techStack.join(" ")}`.toLowerCase().includes(q),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** 주소의 slug로 공개 프로젝트 하나를 찾습니다. 비공개 프로젝트도 외부에는 없는 것처럼 처리합니다. */
export function getProjectBySlug(slug: string) {
  const item = readContentFile("projects", slug);
  if (!item) return undefined;
  const project = toProject(item);
  return project.isPublished ? project : undefined;
}
