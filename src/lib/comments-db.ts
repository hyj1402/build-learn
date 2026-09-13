import { createClient } from "@/lib/supabase/server";

export type LogComment = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

/**
 * 공개 Log 상세 페이지에서 쓸 댓글 목록을 오래된 순으로 가져옵니다.
 * RLS가 이미 "공개된 글의 댓글만" 필터링하므로 여기서는 slug로만 조회합니다.
 */
export async function getLogComments(logSlug: string): Promise<LogComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("log_comments")
    .select("id, author_id, author_name, body, created_at")
    .eq("log_slug", logSlug)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`댓글을 불러오지 못했습니다: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
  }));
}
