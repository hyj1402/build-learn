import { cache } from "react";
import { DEFAULT_PROJECT_THUMBNAIL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectFilter, ProjectStatus } from "@/types/project";

type ProjectRow = {
  slug: string;
  title: string;
  summary: string;
  body_text: string;
  thumbnail_path: string | null;
  publication_status: "draft" | "private" | "published";
  project_status: "planned" | "in_progress" | "completed" | "archived";
  tech_stack: string[];
  period_start: string | null;
  period_end: string | null;
  demo_type: "embed" | "link" | "download" | null;
  demo_url: string | null;
  download_url: string | null;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Supabase 관계 조회는 현재 SDK 설정에서 객체로 오지만, 타입 생성 방식에 따라 배열일 수도 있어 둘 다 안전하게 처리합니다.
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

/** DB의 프로젝트 상태 표기를 기존 카드 컴포넌트가 쓰는 표기로 맞춥니다. */
function toProjectStatus(status: ProjectRow["project_status"]): ProjectStatus {
  if (status === "in_progress") return "in-progress";
  if (status === "archived") return "archived";
  return "completed";
}

/** Supabase의 한 프로젝트 행을 기존 Project 카드와 상세 화면에서 쓰는 형태로 변환합니다. */
function toProject(row: ProjectRow): Project {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    // 대표 이미지가 없으면 공용 기본 이미지를 보여 줍니다(DB 값은 그대로 비워 둡니다).
    thumbnailImage: row.thumbnail_path || DEFAULT_PROJECT_THUMBNAIL,
    // 카테고리가 아직 지정되지 않은 데이터도 목록에서 안전하게 보이도록 web으로 처리합니다.
    category: (category?.slug ?? "web") as Project["category"],
    status: toProjectStatus(row.project_status),
    techStack: row.tech_stack,
    period: { start: row.period_start ?? "", end: row.period_end ?? undefined },
    demoType: row.demo_type ?? undefined,
    demoUrl: row.demo_url ?? undefined,
    downloadUrl: row.download_url ?? undefined,
    isPublished: row.publication_status === "published",
    isFeatured: row.is_featured,
    viewCount: row.view_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    content: row.body_text,
  };
}

/** 공개 상태인 프로젝트만 읽고, 목록의 검색·필터 조건을 서버에서 적용합니다. */
export const getPublishedProjects = cache(
  async (filter: ProjectFilter = {}): Promise<Project[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "slug, title, summary, body_text, thumbnail_path, publication_status, project_status, tech_stack, period_start, period_end, demo_type, demo_url, download_url, is_featured, view_count, created_at, updated_at, categories(name, slug)",
      )
      .eq("publication_status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw new Error(`프로젝트를 불러오지 못했습니다: ${error.message}`);

    const query = filter.query?.trim().toLowerCase();
    return (data as ProjectRow[])
      .map(toProject)
      .filter((project) => !filter.category || project.category === filter.category)
      .filter((project) => filter.featured === undefined || project.isFeatured === filter.featured)
      .filter(
        (project) =>
          !query ||
          `${project.title} ${project.summary} ${project.techStack.join(" ")}`
            .toLowerCase()
            .includes(query),
      );
  },
);

/** 공개 프로젝트 상세 화면과 metadata가 같은 행을 재사용하도록 slug 조회를 제공합니다. */
export const getPublishedProjectBySlug = cache(
  async (slug: string): Promise<Project | undefined> => {
    const projects = await getPublishedProjects();
    return projects.find((project) => project.slug === slug);
  },
);

/**
 * 브라우저의 중복 조회 제한을 통과한 공개 Project 조회수를 1 늘립니다.
 * DB의 SECURITY DEFINER 함수가 공개된 글의 view_count만 건드리도록 제한하므로,
 * 로그인하지 않은 방문자도 안전하게 호출할 수 있습니다. 실패해도 페이지 렌더링을 막지 않습니다.
 */
export async function incrementProjectView(slug: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_project_view", { p_slug: slug });
  if (error) console.error(`프로젝트 조회수 증가 실패 (${slug}):`, error.message);
}
