"use server";

import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/auth/admin";
import { generateLogComment } from "@/lib/ai/log-comment";
import { createClient } from "@/lib/supabase/server";

const MIN_LENGTH = 50;
const MAX_BODY_LENGTH = 20000;
const MAX_COMMENT_LENGTH = 3000;
const COOLDOWN_MS = 30_000;

// 서버 인스턴스가 살아 있는 동안 관리자별 마지막 생성 요청을 기록합니다.
// 여러 인스턴스 전체를 묶지는 않지만, 실수로 버튼을 연속 클릭해 API 비용이 쌓이는 일은 줄입니다.
const lastGenerationAtByUser = new Map<string, number>();

export type AiCommentResult =
  { status: "ok"; comment: string } | { status: "error"; message: string };
export type AiCommentSaveResult = { status: "ok" } | { status: "error"; message: string };

/** Server Action은 URL로 직접 호출될 수 있으므로 화면의 관리자 확인과 별개로 매번 권한을 확인합니다. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdminUser(user))) return null;
  return { supabase, userId: user.id };
}

/**
 * 저장된 글 본문을 DB에서 읽어 Claude에게 공개 코멘트 초안을 받습니다.
 * 본문을 브라우저가 보낸 값이 아니라 DB에서 읽으므로, 공개되는 글과 코멘트의 근거가 어긋나지 않습니다.
 * 초안은 저장하지 않고 화면에만 돌려주며, 관리자가 검토·수정한 뒤 saveLogAiComment로 저장합니다.
 */
export async function generateLogAiComment(logId: string): Promise<AiCommentResult> {
  const admin = await requireAdmin();
  if (!admin) return { status: "error", message: "관리자만 사용할 수 있는 기능입니다." };
  const { supabase, userId } = admin;

  const { data: log } = await supabase
    .from("logs")
    .select("title, body_text")
    .eq("id", logId)
    .maybeSingle();
  if (!log) return { status: "error", message: "글을 찾을 수 없습니다." };

  const body = log.body_text.trim();
  if (body.length < MIN_LENGTH) {
    return {
      status: "error",
      message: `코멘트를 만들려면 본문이 ${MIN_LENGTH}자 이상이어야 합니다.`,
    };
  }
  if (body.length > MAX_BODY_LENGTH) {
    return {
      status: "error",
      message: `본문이 너무 깁니다. ${MAX_BODY_LENGTH}자 이내여야 합니다.`,
    };
  }

  const now = Date.now();
  const lastGenerationAt = lastGenerationAtByUser.get(userId);
  const remainingMs = lastGenerationAt ? COOLDOWN_MS - (now - lastGenerationAt) : 0;
  if (remainingMs > 0) {
    return {
      status: "error",
      message: `코멘트 생성은 ${Math.ceil(remainingMs / 1000)}초 후에 다시 요청할 수 있습니다.`,
    };
  }
  // 외부 API 호출 직전에 기록해 동시에 도착한 요청도 한 번만 비용이 발생하도록 합니다.
  lastGenerationAtByUser.set(userId, now);

  try {
    const comment = await generateLogComment({ title: log.title, markdown: body });
    return { status: "ok", comment };
  } catch (error) {
    console.error("AI 공개 코멘트 생성 실패:", error instanceof Error ? error.message : error);
    return { status: "error", message: "코멘트를 만들지 못했습니다. 잠시 후 다시 시도해주세요." };
  }
}

/** 검토를 마친 코멘트를 저장합니다. 빈 문자열이면 코멘트를 삭제하고 공개 화면에서도 사라집니다. */
export async function saveLogAiComment(
  logId: string,
  comment: string,
): Promise<AiCommentSaveResult> {
  const admin = await requireAdmin();
  if (!admin) return { status: "error", message: "관리자만 사용할 수 있는 기능입니다." };
  const { supabase } = admin;

  const text = comment.trim();
  if (text.length > MAX_COMMENT_LENGTH) {
    return { status: "error", message: `코멘트는 ${MAX_COMMENT_LENGTH}자 이내여야 합니다.` };
  }

  const { data, error } = await supabase
    .from("logs")
    .update({
      ai_comment: text || null,
      ai_comment_updated_at: text ? new Date().toISOString() : null,
    })
    .eq("id", logId)
    .select("slug")
    .maybeSingle();
  if (error || !data) {
    console.error("AI 공개 코멘트 저장 실패:", error?.message);
    return { status: "error", message: "저장하지 못했습니다. 잠시 후 다시 시도해주세요." };
  }

  // 공개 상세와 관리자 수정 화면이 새 코멘트를 바로 보여 주도록 캐시를 갱신합니다.
  revalidatePath(`/log/${data.slug}`);
  revalidatePath(`/admin/logs/${logId}/edit`);
  return { status: "ok" };
}
