import type { Metadata } from "next";
import Link from "next/link";
import { LogDateRangePicker } from "@/components/admin/LogDateRangePicker";
import { MessagesTable } from "@/components/admin/MessagesTable";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "문의 수신함" };
const SORT_OPTIONS = ["newest", "oldest", "sender"] as const;
function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}
function dateParam(value: string | string[] | undefined) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

/**
 * Contact 폼으로 들어온 문의 목록입니다.
 * RLS에서 조회 권한을 관리자 UUID에만 준 테이블이라, 방문자는 자신이 보낸 문의조차 다시 읽을 수 없습니다.
 */
export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const values = await searchParams;
  const query = stringParam(values.q).toLocaleLowerCase("ko-KR");
  const selectedStatus = stringParam(values.status);
  const status = ["unread", "read"].includes(selectedStatus) ? selectedStatus : "";
  const dateFrom = dateParam(values.from);
  const dateTo = dateParam(values.to);
  const selectedSort = stringParam(values.sort);
  const sort = SORT_OPTIONS.includes(selectedSort as (typeof SORT_OPTIONS)[number])
    ? selectedSort
    : "newest";
  const supabase = await createClient();
  const { data: messages, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, is_read, created_at")
    .order("created_at", { ascending: false });

  const filteredMessages = (messages ?? []).filter((message) => {
    const searchable = `${message.name}\n${message.email}\n${message.message}`.toLocaleLowerCase(
      "ko-KR",
    );
    const createdDate = message.created_at.slice(0, 10);
    return (
      (!query || searchable.includes(query)) &&
      (!status || (status === "unread" ? !message.is_read : message.is_read)) &&
      (!dateFrom || createdDate >= dateFrom) &&
      (!dateTo || createdDate <= dateTo)
    );
  });
  const unreadCount = filteredMessages.filter((message) => !message.is_read).length;
  const sortedMessages = [...filteredMessages].sort((left, right) => {
    if (sort === "oldest") return left.created_at.localeCompare(right.created_at);
    if (sort === "sender") return left.name.localeCompare(right.name, "ko-KR");
    return right.created_at.localeCompare(left.created_at);
  });

  return (
    <div className="admin-list-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">CONTACT / INBOX</p>
          <h1>문의 수신함</h1>
          <p>
            읽지 않은 문의 {unreadCount}건을 포함해 조건에 맞는 총 {filteredMessages.length}
            건입니다.
          </p>
        </div>
      </header>

      {error && <p className="admin-error-message">목록을 불러오지 못했습니다: {error.message}</p>}

      <form action="/admin/messages" className="admin-list-filter">
        <label className="admin-list-filter-query">
          <span>통합 검색</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="이름, 이메일, 문의 내용 검색"
            type="search"
          />
        </label>
        <label>
          <span>읽음 상태</span>
          <select defaultValue={status} name="status">
            <option value="">전체</option>
            <option value="unread">새 문의</option>
            <option value="read">읽음</option>
          </select>
        </label>
        <label className="admin-list-filter-date">
          <span>수신일</span>
          <LogDateRangePicker from={dateFrom} to={dateTo} />
        </label>
        <label>
          <span>정렬</span>
          <select defaultValue={sort} name="sort">
            <option value="newest">수신일 최신순</option>
            <option value="oldest">수신일 오래된순</option>
            <option value="sender">보낸 사람 가나다순</option>
          </select>
        </label>
        <div className="admin-list-filter-actions">
          <button className="admin-action-button" type="submit">
            검색
          </button>
          <Link className="admin-action-button admin-action-outline" href="/admin/messages">
            초기화
          </Link>
        </div>
      </form>

      <MessagesTable initialMessages={sortedMessages} />
    </div>
  );
}
