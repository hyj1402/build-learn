import { createClient } from "@/lib/supabase/server";

/** Log와 Project 상세가 공통으로 쓰는, DB 열을 화면용 이름으로 바꾼 댓글 형태입니다. */
export type ContentComment = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
};

// 기존 Log 코드의 이름을 유지해, 공통 타입 전환이 다른 기능에 영향을 주지 않게 합니다.
export type LogComment = ContentComment;
export type ProjectComment = ContentComment;

/**
 * 공개 Log 상세 페이지에서 쓸 댓글 목록을 오래된 순으로 가져옵니다.
 * RLS가 이미 "공개된 글의 댓글만" 필터링하므로 여기서는 slug로만 조회합니다.
 */
export async function getLogComments(logSlug: string): Promise<LogComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("log_comments")
    .select("id, author_id, author_name, body, created_at, updated_at")
    .eq("log_slug", logSlug)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`댓글을 불러오지 못했습니다: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/** 공개 Project 상세에서 활성 댓글을 오래된 순으로 가져옵니다. 실제 공개·삭제 필터는 RLS가 최종 판단합니다. */
export async function getProjectComments(projectSlug: string): Promise<ProjectComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_comments")
    .select("id, author_id, author_name, body, created_at, updated_at")
    .eq("project_slug", projectSlug)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`댓글을 불러오지 못했습니다: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
