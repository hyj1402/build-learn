"use server";

import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_COMMENT_LENGTH = 1000;
export type CommentContentType = "log" | "project";

/** 브라우저가 보낸 종류를 그대로 테이블 이름에 쓰지 않고, 두 허용 값만 통과시킵니다. */
function requireCommentContentType(value: string): CommentContentType {
  if (value === "log" || value === "project") return value;
  throw new Error("알 수 없는 댓글 종류입니다.");
}

/** 관리자 전용 댓글 액션은 레이아웃 통과 여부와 별개로 호출 시점에 권한을 다시 확인합니다. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(user))) {
    throw new Error("관리자만 댓글을 관리할 수 있습니다.");
  }
  return supabase;
}

/** 댓글 관리 결과가 바뀌는 공개·관리자 화면을 함께 갱신합니다. */
function revalidateCommentViews(contentType: CommentContentType, slug: string) {
  revalidatePath("/admin/comments");
  revalidatePath("/admin/project-comments");
  revalidatePath("/admin/logs");
  revalidatePath("/admin/projects");
  revalidatePath(contentType === "log" ? `/log/${slug}` : `/projects/${slug}`);
}

/** 관리자가 댓글을 소프트 삭제합니다. 원문과 작성자는 DB에 남아 관리자 화면에서 복구할 수 있습니다. */
export async function softDeleteComment(commentId: string, contentTypeValue: string) {
  const supabase = await requireAdmin();
  const contentType = requireCommentContentType(contentTypeValue);

  if (contentType === "project") {
    const { data, error } = await supabase
      .from("project_comments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", commentId)
      .select("project_slug")
      .maybeSingle();
    if (error) throw new Error(`댓글을 삭제하지 못했습니다: ${error.message}`);
    if (!data) throw new Error("이미 삭제되었거나 삭제할 수 없는 댓글입니다.");
    revalidateCommentViews(contentType, data.project_slug);
    return;
  }

  const { data, error } = await supabase
    .from("log_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)
    .select("log_slug")
    .maybeSingle();

  if (error) throw new Error(`댓글을 삭제하지 못했습니다: ${error.message}`);
  if (!data) throw new Error("이미 삭제되었거나 삭제할 수 없는 댓글입니다.");

  revalidateCommentViews(contentType, data.log_slug);
}

/** 관리자가 삭제된 댓글을 다시 일반 사용자에게 보이도록 복구합니다. */
export async function restoreComment(commentId: string, contentTypeValue: string) {
  const supabase = await requireAdmin();
  const contentType = requireCommentContentType(contentTypeValue);
  if (contentType === "project") {
    const { data, error } = await supabase
      .from("project_comments")
      .update({ deleted_at: null })
      .eq("id", commentId)
      .not("deleted_at", "is", null)
      .select("project_slug")
      .maybeSingle();
    if (error) throw new Error(`댓글을 복구하지 못했습니다: ${error.message}`);
    if (!data) throw new Error("삭제된 댓글을 찾지 못했습니다.");
    revalidateCommentViews(contentType, data.project_slug);
    return;
  }
  const { data, error } = await supabase
    .from("log_comments")
    .update({ deleted_at: null })
    .eq("id", commentId)
    .not("deleted_at", "is", null)
    .select("log_slug")
    .maybeSingle();

  if (error) throw new Error(`댓글을 복구하지 못했습니다: ${error.message}`);
  if (!data) throw new Error("삭제된 댓글을 찾지 못했습니다.");

  revalidateCommentViews(contentType, data.log_slug);
}

/** 관리자가 어떤 회원의 댓글이든 본문을 수정합니다. 작성자·원 글은 DB 트리거가 바꾸지 못하게 합니다. */
export async function updateComment(commentId: string, body: string, contentTypeValue: string) {
  const supabase = await requireAdmin();
  const contentType = requireCommentContentType(contentTypeValue);
  const trimmed = body.trim();
  if (!trimmed) throw new Error("댓글 내용을 입력해주세요.");
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    throw new Error(`댓글은 ${MAX_COMMENT_LENGTH}자 이내로 작성해주세요.`);
  }

  if (contentType === "project") {
    const { data, error } = await supabase
      .from("project_comments")
      .update({ body: trimmed })
      .eq("id", commentId)
      .select("project_slug")
      .maybeSingle();
    if (error) throw new Error(`댓글을 수정하지 못했습니다: ${error.message}`);
    if (!data) throw new Error("댓글을 찾지 못했습니다.");
    revalidateCommentViews(contentType, data.project_slug);
    return;
  }

  const { data, error } = await supabase
    .from("log_comments")
    .update({ body: trimmed })
    .eq("id", commentId)
    .select("log_slug")
    .maybeSingle();

  if (error) throw new Error(`댓글을 수정하지 못했습니다: ${error.message}`);
  if (!data) throw new Error("댓글을 찾지 못했습니다.");

  revalidateCommentViews(contentType, data.log_slug);
}
