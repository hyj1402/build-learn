import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Log, LogCategory, LogFilter } from "@/types/log";

type LogRow = {
  slug: string;
  title: string;
  summary: string | null;
  body_text: string;
  thumbnail_path: string | null;
  tags: string[];
  publication_status: "draft" | "private" | "published";
  display_order: number | null;
  view_count: number;
  ai_comment: string | null;
  created_at: string;
  updated_at: string;
  // Supabase 관계 조회는 현재 SDK 설정에서 객체로 오지만, 타입 생성 방식에 따라 배열일 수도 있어 둘 다 안전하게 처리합니다.
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

/** Supabase의 한 Log 행을 기존 카드·상세 화면이 쓰는 Log 타입으로 변환합니다. */
function toLog(row: LogRow): Log {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? undefined,
    thumbnailImage: row.thumbnail_path ?? undefined,
    // 카테고리가 아직 지정되지 않은 데이터도 목록에서 안전하게 보이도록 etc로 처리합니다.
    category: (category?.slug ?? "etc") as LogCategory,
    tags: row.tags,
    isPublished: row.publication_status === "published",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    order: row.display_order ?? undefined,
    viewCount: row.view_count,
    aiComment: row.ai_comment ?? undefined,
    content: row.body_text,
  };
}

/**
 * 공개(published) 상태인 Log만 읽고, 카테고리·태그·검색어 조건을 서버에서 적용합니다.
 * 날짜가 같으면 order가 큰 작업이 최신이며, 마지막 slug 비교는 결과 순서를 항상 일정하게 만듭니다.
 */
export const getPublishedLogs = cache(async (filter: LogFilter = {}): Promise<Log[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("logs")
    .select(
      "slug, title, summary, body_text, thumbnail_path, tags, publication_status, display_order, view_count, ai_comment, created_at, updated_at, categories(name, slug)",
    )
    .eq("publication_status", "published");

  if (error) throw new Error(`학습 기록을 불러오지 못했습니다: ${error.message}`);

  const q = filter.query?.trim().toLowerCase();
  return (data as LogRow[])
    .map(toLog)
    .filter((log) => !filter.category || log.category === filter.category)
    .filter((log) => !filter.tag || log.tags.includes(filter.tag))
    .filter(
      (log) =>
        !q || `${log.title} ${log.summary ?? ""} ${log.tags.join(" ")}`.toLowerCase().includes(q),
    )
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) ||
        (b.order ?? 0) - (a.order ?? 0) ||
        b.slug.localeCompare(a.slug),
    );
});

/** 공개 Log 상세 화면과 metadata가 같은 행을 재사용하도록 slug 조회를 제공합니다. */
export const getPublishedLogBySlug = cache(async (slug: string): Promise<Log | undefined> => {
  const logs = await getPublishedLogs();
  return logs.find((log) => log.slug === slug);
});

/**
 * 상세 페이지가 렌더될 때마다 조회수를 1 늘립니다.
 * DB의 SECURITY DEFINER 함수가 공개된 글의 view_count만 건드리도록 제한하므로,
 * 로그인하지 않은 방문자도 안전하게 호출할 수 있습니다. 실패해도 페이지 렌더링을 막지 않습니다.
 */
export async function incrementLogView(slug: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_log_view", { p_slug: slug });
  if (error) console.error(`Log 조회수 증가 실패 (${slug}):`, error.message);
}
