import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** 로그인한 사용자의 user_roles 행을 읽어 관리자 여부를 반환합니다. 역할이 없거나 로그인하지 않았으면 false입니다. */
export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return !error && data?.role === "admin";
}
