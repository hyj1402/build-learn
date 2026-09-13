"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LogComment } from "@/lib/comments-db";

const MAX_COMMENT_LENGTH = 1000;

/**
 * 로그인한 회원이 공개 Log 글에 댓글을 남깁니다.
 * 여기서 로그인 여부와 글의 공개 상태를 미리 확인하지만, 실제 차단은 DB의 RLS 정책이 한 번 더 해줍니다.
 * DB가 실제로 만든 행(진짜 id 포함)을 그대로 반환해서, 화면에서 임시 id를 지어내지 않게 합니다
 * (임시 id를 썼더니 등록 직후 바로 삭제를 누르면 존재하지 않는 id를 지우려다 에러가 나던 문제가 있었습니다).
 */
export async function addLogComment(logSlug: string, body: string): Promise<LogComment> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("댓글을 남기려면 로그인이 필요합니다.");
  }

  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("댓글 내용을 입력해주세요.");
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    throw new Error(`댓글은 ${MAX_COMMENT_LENGTH}자 이내로 작성해주세요.`);
  }

  // 이메일을 그대로 공개하지 않도록, 로그인 방식이 제공하는 표시 이름을 우선 사용합니다.
  const authorName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "회원";

  const { data, error } = await supabase
    .from("log_comments")
    .insert({
      log_slug: logSlug,
      author_id: user.id,
      author_name: authorName,
      body: trimmed,
    })
    .select("id, author_id, author_name, body, created_at")
    .single();

  if (error) throw new Error(`댓글을 저장하지 못했습니다: ${error.message}`);

  revalidatePath(`/log/${logSlug}`);

  return {
    id: data.id,
    authorId: data.author_id,
    authorName: data.author_name,
    body: data.body,
    createdAt: data.created_at,
  };
}

/** 댓글 작성자 본인 또는 관리자가 댓글을 삭제합니다. 권한이 없으면 RLS가 삭제 자체를 막습니다. */
export async function deleteLogComment(commentId: string, logSlug: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("log_comments").delete().eq("id", commentId);

  if (error) throw new Error(`댓글을 삭제하지 못했습니다: ${error.message}`);

  revalidatePath(`/log/${logSlug}`);
}
