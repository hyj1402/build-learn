"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LogComment } from "@/lib/comments-db";

const MAX_COMMENT_LENGTH = 1000;

/** DB 행을 공개 댓글 화면이 쓰는 camelCase 형태로 바꿉니다. */
function toLogComment(row: {
  id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
  updated_at: string | null;
}): LogComment {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
    .select("id, log_slug, author_id, author_name, body, created_at, updated_at")
    .single();

  if (error) {
    console.error(`Log 댓글 저장 실패 (${logSlug}):`, error.message);
    throw new Error("댓글을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  revalidatePath(`/log/${logSlug}`);

  return toLogComment(data);
}

/** 댓글 작성자 본인 또는 관리자가 댓글을 일반 조회에서 숨기되, 관리자에게는 원문을 보존합니다. */
export async function deleteLogComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("댓글을 삭제하려면 로그인이 필요합니다.");
  }

  // DELETE가 아니라 삭제 시각을 기록합니다. RLS가 다른 회원의 댓글과 이미 삭제된 댓글을 대상에서 제외합니다.
  const { data, error } = await supabase
    .from("log_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)
    .is("deleted_at", null)
    .select("id, log_slug")
    .maybeSingle();

  if (error) {
    console.error(`Log 댓글 삭제 실패 (${commentId}):`, error.message);
    throw new Error("댓글을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
  if (!data) throw new Error("삭제 권한이 없거나 이미 삭제된 댓글입니다.");

  // 브라우저가 보내 준 주소가 아니라 실제 삭제된 행의 slug를 사용해 정확한 글만 갱신합니다.
  revalidatePath(`/log/${data.log_slug}`);
  revalidatePath("/admin/logs");
  revalidatePath("/admin/comments");
}

/** 댓글 작성자 본인 또는 관리자가 본문만 수정합니다. 변경할 수 없는 작성자·글 정보는 DB 트리거가 지킵니다. */
export async function updateLogComment(commentId: string, body: string): Promise<LogComment> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("댓글을 수정하려면 로그인이 필요합니다.");

  const trimmed = body.trim();
  if (!trimmed) throw new Error("댓글 내용을 입력해주세요.");
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    throw new Error(`댓글은 ${MAX_COMMENT_LENGTH}자 이내로 작성해주세요.`);
  }

  const { data, error } = await supabase
    .from("log_comments")
    .update({ body: trimmed })
    .eq("id", commentId)
    .select("id, log_slug, author_id, author_name, body, created_at, updated_at")
    .maybeSingle();
  if (error) {
    console.error(`Log 댓글 수정 실패 (${commentId}):`, error.message);
    throw new Error("댓글을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
  if (!data) throw new Error("수정 권한이 없거나 삭제된 댓글입니다.");

  revalidatePath(`/log/${data.log_slug}`);
  revalidatePath("/admin/comments");
  return toLogComment(data);
}
