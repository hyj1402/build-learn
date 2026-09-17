"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProjectComment } from "@/lib/comments-db";

const MAX_COMMENT_LENGTH = 1000;

/** DB 행을 공개 Project 댓글 화면이 쓰는 camelCase 형태로 바꿉니다. */
function toProjectComment(row: {
  id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
  updated_at: string | null;
}): ProjectComment {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 로그인한 회원이 공개 Project에 댓글을 남깁니다. 서버 검사 뒤에도 RLS가 작성자와 공개 상태를 다시 확인합니다. */
export async function addProjectComment(
  projectSlug: string,
  body: string,
): Promise<ProjectComment> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("댓글을 남기려면 로그인이 필요합니다.");

  const trimmed = body.trim();
  if (!trimmed) throw new Error("댓글 내용을 입력해주세요.");
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    throw new Error(`댓글은 ${MAX_COMMENT_LENGTH}자 이내로 작성해주세요.`);
  }

  // 이메일을 공개하지 않도록 로그인 제공자가 준 표시 이름만 저장합니다.
  const authorName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "회원";
  const { data, error } = await supabase
    .from("project_comments")
    .insert({
      project_slug: projectSlug,
      author_id: user.id,
      author_name: authorName,
      body: trimmed,
    })
    .select("id, project_slug, author_id, author_name, body, created_at, updated_at")
    .single();
  if (error) throw new Error(`댓글을 저장하지 못했습니다: ${error.message}`);

  revalidatePath(`/projects/${projectSlug}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin/comments");
  return toProjectComment(data);
}

/** 댓글 작성자 본인 또는 관리자가 댓글을 일반 조회에서 숨깁니다. 행은 관리자 복구를 위해 보존합니다. */
export async function deleteProjectComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("댓글을 삭제하려면 로그인이 필요합니다.");

  const { data, error } = await supabase
    .from("project_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)
    .is("deleted_at", null)
    .select("id, project_slug")
    .maybeSingle();
  if (error) throw new Error(`댓글을 삭제하지 못했습니다: ${error.message}`);
  if (!data) throw new Error("삭제 권한이 없거나 이미 삭제된 댓글입니다.");

  revalidatePath(`/projects/${data.project_slug}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin/comments");
}

/** 댓글 작성자 본인 또는 관리자가 본문만 수정합니다. 소속 Project·작성자 보호는 DB 트리거가 맡습니다. */
export async function updateProjectComment(
  commentId: string,
  body: string,
): Promise<ProjectComment> {
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
    .from("project_comments")
    .update({ body: trimmed })
    .eq("id", commentId)
    .select("id, project_slug, author_id, author_name, body, created_at, updated_at")
    .maybeSingle();
  if (error) throw new Error(`댓글을 수정하지 못했습니다: ${error.message}`);
  if (!data) throw new Error("수정 권한이 없거나 삭제된 댓글입니다.");

  revalidatePath(`/projects/${data.project_slug}`);
  revalidatePath("/admin/comments");
  return toProjectComment(data);
}
