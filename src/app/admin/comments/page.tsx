import type { Metadata } from "next";
import Link from "next/link";
import { AdminCommentActions } from "@/components/admin/AdminCommentActions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "댓글 관리" };

const STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  private: "비공개",
  published: "공개",
};

/** 모든 Log 댓글을 최신순으로 보여 주고, `?log=slug`가 있으면 해당 글의 댓글만 좁혀 봅니다. */
export default async function AdminCommentsPage({ searchParams }: PageProps<"/admin/comments">) {
  const values = await searchParams;
  const selectedLog = typeof values.log === "string" ? values.log : "";
  const supabase = await createClient();

  let commentsQuery = supabase
    .from("log_comments")
    .select("id, log_slug, author_name, body, created_at, updated_at, deleted_at")
    .order("created_at", { ascending: false });
  if (selectedLog) commentsQuery = commentsQuery.eq("log_slug", selectedLog);

  const { data: comments, error } = await commentsQuery;
  const slugs = [...new Set((comments ?? []).map((comment) => comment.log_slug))];
  const { data: logs } = slugs.length
    ? await supabase.from("logs").select("id, slug, title, publication_status").in("slug", slugs)
    : { data: [] };
  const logsBySlug = new Map((logs ?? []).map((log) => [log.slug, log]));
  const selectedTitle = selectedLog ? logsBySlug.get(selectedLog)?.title : null;

  return (
    <div className="admin-list-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">COMMUNITY / COMMENTS</p>
          <h1>댓글 관리</h1>
          <p>
            {selectedLog
              ? `“${selectedTitle ?? selectedLog}” 글의 댓글 ${(comments ?? []).length}건입니다.`
              : `삭제된 댓글을 포함해 모든 학습 기록의 댓글 ${(comments ?? []).length}건입니다.`}
          </p>
        </div>
        {selectedLog && (
          <Link className="admin-primary-action" href="/admin/comments">
            전체 댓글 보기
          </Link>
        )}
      </header>

      {error && <p className="admin-error-message">댓글을 불러오지 못했습니다: {error.message}</p>}

      <div className="admin-table-wrap admin-table-wrap-soft">
        <table className="admin-table admin-table-soft admin-comments-table">
          <thead>
            <tr>
              <th>학습 기록</th>
              <th>작성자</th>
              <th>댓글 내용</th>
              <th>상태·기록</th>
              <th>
                <span className="sr-only">작업</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(comments ?? []).map((comment) => {
              const log = logsBySlug.get(comment.log_slug);
              return (
                <tr key={comment.id} className={comment.deleted_at ? "is-deleted" : undefined}>
                  <td>
                    {log ? (
                      <Link className="admin-row-title" href={`/admin/logs/${log.id}/edit`}>
                        {log.title}
                      </Link>
                    ) : (
                      <strong className="admin-table-title">{comment.log_slug}</strong>
                    )}
                    {log && (
                      <span className={`admin-status admin-status-${log.publication_status}`}>
                        {STATUS_LABEL[log.publication_status] ?? log.publication_status}
                      </span>
                    )}
                  </td>
                  <td>{comment.author_name}</td>
                  <td className="admin-comment-body">
                    {comment.deleted_at && (
                      <span className="admin-comment-deleted-label">삭제됨 · 관리자 전용</span>
                    )}
                    {comment.body}
                  </td>
                  <td className="admin-date">
                    <time dateTime={comment.created_at}>
                      작성 {new Date(comment.created_at).toLocaleString("ko-KR")}
                    </time>
                    {comment.updated_at && (
                      <time dateTime={comment.updated_at}>
                        수정 {new Date(comment.updated_at).toLocaleString("ko-KR")}
                      </time>
                    )}
                    {comment.deleted_at && (
                      <time dateTime={comment.deleted_at}>
                        삭제 {new Date(comment.deleted_at).toLocaleString("ko-KR")}
                      </time>
                    )}
                  </td>
                  <td className="admin-row-actions-cell">
                    <AdminCommentActions
                      commentId={comment.id}
                      initialBody={comment.body}
                      isDeleted={Boolean(comment.deleted_at)}
                      contentType="log"
                    />
                  </td>
                </tr>
              );
            })}
            {(comments ?? []).length === 0 && (
              <tr>
                <td className="admin-empty-cell" colSpan={5}>
                  {selectedLog
                    ? "이 학습 기록에는 댓글이 없습니다."
                    : "아직 등록된 댓글이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
