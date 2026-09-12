import type { Metadata } from "next";
import { MessagesTable } from "@/components/admin/MessagesTable";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "문의 수신함" };

/**
 * Contact 폼으로 들어온 문의 목록입니다.
 * RLS에서 조회 권한을 관리자 UUID에만 준 테이블이라, 방문자는 자신이 보낸 문의조차 다시 읽을 수 없습니다.
 */
export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, is_read, created_at")
    .order("created_at", { ascending: false });

  const unreadCount = (messages ?? []).filter((m) => !m.is_read).length;

  return (
    <div className="admin-list-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">CONTACT / INBOX</p>
          <h1>문의 수신함</h1>
          <p>
            읽지 않은 문의 {unreadCount}건을 포함해 총 {(messages ?? []).length}건입니다.
          </p>
        </div>
      </header>

      {error && <p className="admin-error-message">목록을 불러오지 못했습니다: {error.message}</p>}

      <MessagesTable initialMessages={messages ?? []} />
    </div>
  );
}
