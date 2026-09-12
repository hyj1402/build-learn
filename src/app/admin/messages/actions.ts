"use server";

import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

// Server Action은 외부에서 직접 호출될 수 있는 엔드포인트와 같으므로,
// layout의 관리자 확인과 별개로 각 액션에서 다시 관리자인지 확인합니다.
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdminUser(user))) {
    throw new Error("관리자만 사용할 수 있는 기능입니다.");
  }
  return supabase;
}

/**
 * 하나 이상 선택한 문의를 읽음으로 표시합니다.
 * id 배열을 받는 이유는 개별 클릭과 체크박스 일괄 처리가 같은 권한 검사·DB 갱신 규칙을 쓰게 하기 위해서입니다.
 */
export async function markMessagesRead(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await requireAdmin();
  const { error } = await supabase.from("contact_messages").update({ is_read: true }).in("id", ids);
  if (error) {
    throw new Error(`상태를 바꾸지 못했습니다: ${error.message}`);
  }
  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
}

/** 스팸이나 처리 완료된 문의를 삭제합니다. */
export async function deleteMessage(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) {
    throw new Error(`삭제하지 못했습니다: ${error.message}`);
  }
  revalidatePath("/admin/messages");
}
