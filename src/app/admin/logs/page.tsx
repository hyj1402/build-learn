import Link from "next/link";
import type { Metadata } from "next";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { LogDateRangePicker } from "@/components/admin/LogDateRangePicker";
import { LOG_CATEGORY_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { deleteLog } from "./actions";

export const metadata: Metadata = { title: "학습 기록 관리" };

const STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  private: "비공개",
  published: "공개",
};
const VALID_STATUS = Object.keys(STATUS_LABEL);
const SORT_OPTIONS = ["newest", "oldest", "views", "title"] as const;

/** URL 쿼리에서 날짜 입력 형식(YYYY-MM-DD)만 허용해 목록 비교에 사용합니다. */
function dateParam(value: string | string[] | undefined) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

/** 브라우저가 보내는 검색 조건을 문자열 하나로 정리합니다. */
function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

// 관리자 계정으로 조회하므로 RLS 덕분에 draft/private까지 전부 보입니다 (일반 방문자는 published만 봄).
export default async function AdminLogsPage({ searchParams }: PageProps<"/admin/logs">) {
  const values = await searchParams;
  const pageValue = Number(stringParam(values.page));
  const requestedPage = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const query = stringParam(values.q).toLocaleLowerCase("ko-KR");
  const selectedStatus = stringParam(values.status);
  const status = VALID_STATUS.includes(selectedStatus) ? selectedStatus : "";
  const selectedCategory = stringParam(values.category);
  const category = LOG_CATEGORY_OPTIONS.some((option) => option.value === selectedCategory)
    ? selectedCategory
    : "";
  const dateFrom = dateParam(values.from);
  const dateTo = dateParam(values.to);
  const selectedSort = stringParam(values.sort);
  const sort = SORT_OPTIONS.includes(selectedSort as (typeof SORT_OPTIONS)[number])
    ? selectedSort
    : "newest";
  const pageSize = 10;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("logs")
    .select(
      "id, slug, title, summary, body_text, tags, publication_status, view_count, created_at, categories(name, slug), log_comments(count)",
    )
    .order("created_at", { ascending: false });

  // 제목·본문·태그는 OR 검색이어야 합니다. PostgREST 원시 or 문자열을 직접 조립하지 않고,
  // 관리자 전용의 작은 목록을 받은 뒤 서버에서 비교해 특수문자가 쿼리 문법이 되는 일을 막습니다.
  const filteredLogs = (data ?? []).filter((log) => {
    const logCategory = Array.isArray(log.categories) ? log.categories[0] : log.categories;
    const searchable = `${log.title}\n${log.body_text}\n${log.tags.join(" ")}`.toLocaleLowerCase(
      "ko-KR",
    );
    const createdDate = log.created_at.slice(0, 10);
    return (
      (!query || searchable.includes(query)) &&
      (!status || log.publication_status === status) &&
      (!category || logCategory?.slug === category) &&
      (!dateFrom || createdDate >= dateFrom) &&
      (!dateTo || createdDate <= dateTo)
    );
  });
  // 필터 결과를 복사해 정렬하므로 원본 DB 조회 결과와 검색 조건은 변하지 않습니다.
  const sortedLogs = [...filteredLogs].sort((left, right) => {
    if (sort === "oldest") return left.created_at.localeCompare(right.created_at);
    if (sort === "views")
      return right.view_count - left.view_count || right.created_at.localeCompare(left.created_at);
    if (sort === "title") return left.title.localeCompare(right.title, "ko-KR");
    return right.created_at.localeCompare(left.created_at);
  });
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const logs = sortedLogs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="admin-list-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">CONTENT / LOGS</p>
          <h1>학습 기록</h1>
          <p>임시저장과 비공개 글을 포함해 모든 기록을 관리합니다.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/logs/new">
          + 새 글 작성
        </Link>
      </header>

      {error && <p className="admin-error-message">목록을 불러오지 못했습니다: {error.message}</p>}

      <form action="/admin/logs" className="admin-list-filter">
        <label className="admin-list-filter-query">
          <span>통합 검색</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="제목, 상세 내용, 태그 검색"
            type="search"
          />
        </label>
        <label>
          <span>상태</span>
          <select defaultValue={status} name="status">
            <option value="">전체</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>분류</span>
          <select defaultValue={category} name="category">
            <option value="">전체</option>
            {LOG_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-list-filter-date">
          <span>등록일</span>
          <LogDateRangePicker from={dateFrom} to={dateTo} />
        </label>
        <label>
          <span>정렬</span>
          <select defaultValue={sort} name="sort">
            <option value="newest">등록일 최신순</option>
            <option value="oldest">등록일 오래된순</option>
            <option value="views">조회수 높은순</option>
            <option value="title">제목 가나다순</option>
          </select>
        </label>
        <div className="admin-list-filter-actions">
          <button className="admin-action-button" type="submit">
            검색
          </button>
          <Link className="admin-action-button admin-action-outline" href="/admin/logs">
            초기화
          </Link>
        </div>
      </form>

      <p className="admin-list-filter-result" aria-live="polite">
        조건에 맞는 학습 기록 <strong>{filteredLogs.length}개</strong>
      </p>

      <div className="admin-table-wrap admin-table-wrap-soft">
        <table className="admin-table admin-table-soft">
          <thead>
            <tr>
              <th>제목</th>
              <th>분류</th>
              <th>태그</th>
              <th>상태</th>
              <th>조회</th>
              <th>댓글(삭제 포함)</th>
              <th>등록일</th>
              <th>
                <span className="sr-only">작업</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id}>
                <td>
                  <Link className="admin-row-title" href={`/admin/logs/${log.id}/edit`}>
                    {log.title}
                  </Link>
                  {log.summary && <span className="admin-table-description">{log.summary}</span>}
                </td>
                <td>
                  {(() => {
                    const logCategory = Array.isArray(log.categories)
                      ? log.categories[0]
                      : log.categories;
                    return logCategory ? (
                      <span className="admin-category-label">{logCategory.slug.toUpperCase()}</span>
                    ) : (
                      <span className="admin-muted-value">미분류</span>
                    );
                  })()}
                </td>
                <td>
                  <div className="admin-list-chips" aria-label={`${log.title} 태그`}>
                    {log.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                    {log.tags.length > 3 && <span>+{log.tags.length - 3}</span>}
                  </div>
                </td>
                <td>
                  <span className={`admin-status admin-status-${log.publication_status}`}>
                    {STATUS_LABEL[log.publication_status] ?? log.publication_status}
                  </span>
                </td>
                <td className="admin-number-value">{log.view_count.toLocaleString("ko-KR")}</td>
                <td>
                  {/* 관리자 운영용 숫자라 소프트 삭제된 댓글까지 함께 셉니다. 실제 공개 댓글 수는 상세 화면에서 확인합니다. */}
                  <Link
                    className="admin-inline-link"
                    href={`/admin/comments?log=${encodeURIComponent(log.slug)}`}
                  >
                    {log.log_comments[0]?.count ?? 0}개
                  </Link>
                </td>
                <td className="admin-date">
                  {new Date(log.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="admin-row-actions-cell">
                  <div className="admin-row-actions">
                    <AdminConfirmButton
                      confirmTitle="이 학습 기록을 삭제할까요?"
                      confirmDescription={`"${log.title}" 글이 완전히 삭제되며, 되돌릴 수 없습니다.`}
                      onConfirm={deleteLog.bind(null, log.id)}
                      triggerClassName="admin-action-button admin-action-outline-danger admin-row-action-button"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(logs ?? []).length === 0 && (
              <tr>
                <td className="admin-empty-cell" colSpan={8}>
                  {data?.length
                    ? "조건에 맞는 학습 기록이 없습니다."
                    : "아직 작성된 학습 기록이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/logs"
        currentPage={page}
        label="학습 기록 목록 페이지"
        searchParams={{ q: query, status, category, from: dateFrom, to: dateTo, sort }}
        totalPages={totalPages}
      />
    </div>
  );
}
