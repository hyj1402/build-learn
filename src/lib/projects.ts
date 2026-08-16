import { readContentFile, readContentFiles } from "@/lib/mdx";
import type { Project, ProjectFilter } from "@/types/project";
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
    createdAt: String(item.data.createdAt),
    updatedAt: item.data.updatedAt,
    content: item.content,
  };
}
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
export function getProjectBySlug(slug: string) {
  const item = readContentFile("projects", slug);
  if (!item) return undefined;
  const project = toProject(item);
  return project.isPublished ? project : undefined;
}
