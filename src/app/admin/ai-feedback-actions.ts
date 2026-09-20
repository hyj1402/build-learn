"use server";

import { isAdminUser } from "@/lib/auth/admin";
import { getWritingFeedback, type WritingFeedback } from "@/lib/ai/writing-feedback";
import { createClient } from "@/lib/supabase/server";

const MIN_LENGTH = 50;
const MAX_LENGTH = 20000;

export type AiFeedbackState =
  { status: "ok"; feedback: WritingFeedback } | { status: "error"; message: string };

/**
 * 관리자가 글 초안에 대한 AI 피드백을 요청합니다. API 호출은 비용이 들기 때문에
 * 화면(layout)의 관리자 확인과 별개로 여기서 다시 권한을 확인하고, 실패는 던지지 않고 값으로 돌려줍니다.
 */
export async function requestWritingFeedback(
  title: string,
  markdown: string,
  kind: "log" | "project",
): Promise<AiFeedbackState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdminUser(user))) {
    return { status: "error", message: "관리자만 사용할 수 있는 기능입니다." };
  }

  const body = markdown.trim();
  if (body.length < MIN_LENGTH) {
    return { status: "error", message: `피드백을 받으려면 본문을 ${MIN_LENGTH}자 이상 써주세요.` };
  }
  if (body.length > MAX_LENGTH) {
    return { status: "error", message: `본문이 너무 깁니다. ${MAX_LENGTH}자 이내로 줄여주세요.` };
  }

  try {
    const feedback = await getWritingFeedback({
      title: title.trim().slice(0, 200),
      kind,
      markdown: body,
    });
    return { status: "ok", feedback };
  } catch (error) {
    console.error("AI 글쓰기 피드백 실패:", error instanceof Error ? error.message : error);
    return { status: "error", message: "AI 피드백을 받지 못했습니다. 잠시 후 다시 시도해주세요." };
  }
}
