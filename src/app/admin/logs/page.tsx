import Link from "next/link";
import type { Metadata } from "next";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { deleteLog } from "./actions";

export const metadata: Metadata = { title: "학습 기록 관리" };

const STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  private: "비공개",
  published: "공개",
};

// 관리자 계정으로 조회하므로 RLS 덕분에 draft/private까지 전부 보입니다 (일반 방문자는 published만 봄).
export default async function AdminLogsPage({ searchParams }: PageProps<"/admin/logs">) {
  const values = await searchParams;
  const pageValue = typeof values.page === "string" ? Number(values.page) : 1;
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const supabase = await createClient();
  const {
    data: logs,
    error,
    count,
  } = await supabase
    .from("logs")
    .select("id, slug, title, summary, tags, publication_status, created_at, log_comments(count)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

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

      <div className="admin-table-wrap admin-table-wrap-soft">
        <table className="admin-table admin-table-soft">
          <thead>
            <tr>
              <th>제목</th>
              <th>태그</th>
              <th>상태</th>
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
                <td className="admin-empty-cell" colSpan={6}>
                  아직 작성된 학습 기록이 없습니다.
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
        totalPages={totalPages}
      />
    </div>
  );
}
