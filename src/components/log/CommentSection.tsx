"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import type { LogComment } from "@/lib/comments-db";
import { addLogComment, deleteLogComment } from "@/app/(site)/log/[slug]/actions";

const MAX_COMMENT_LENGTH = 1000;

/** DB의 ISO 시간을 "2026.09.13 14:20" 형태로 바꿉니다. */
function formatCommentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Log 상세 페이지 하단의 댓글 목록·작성 폼입니다.
 * 로그인 여부와 관리자 여부는 서버 컴포넌트(page.tsx)에서 이미 확인해 props로 내려받습니다.
 */
export function CommentSection({
  logSlug,
  initialComments,
  currentUserId,
  isAdmin,
}: {
  logSlug: string;
  initialComments: LogComment[];
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    const body = draft;

    startTransition(async () => {
      try {
        await addLogComment(logSlug, body);
        setDraft("");
        // 서버에서 다시 목록을 받아오는 대신, 방금 쓴 내용을 그대로 화면에 즉시 추가합니다.
        setComments((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            authorId: currentUserId ?? "",
            authorName: "나",
            body: body.trim(),
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "댓글을 남기지 못했습니다.");
      }
    });
  }

  function handleDelete(commentId: string) {
    if (!window.confirm("댓글을 삭제할까요?")) return;

    startTransition(async () => {
      try {
        await deleteLogComment(commentId, logSlug);
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "댓글을 삭제하지 못했습니다.");
      }
    });
  }

  return (
    <section className="comment-section" aria-labelledby="comment-heading">
      <h2 id="comment-heading">댓글 {comments.length}개</h2>

      {comments.length === 0 ? (
        <p className="comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-item-head">
                <strong>{comment.authorName}</strong>
                <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
              </div>
              <p>{comment.body}</p>
              {(isAdmin || comment.authorId === currentUserId) && (
                <button
                  type="button"
                  className="comment-delete"
                  disabled={isPending}
                  onClick={() => handleDelete(comment.id)}
                >
                  삭제
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {currentUserId ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="댓글을 남겨보세요."
            maxLength={MAX_COMMENT_LENGTH}
            required
          />
          <div className="comment-form-footer">
            <span>
              {draft.length} / {MAX_COMMENT_LENGTH}
            </span>
            <button type="submit" disabled={isPending}>
              {isPending ? "등록 중..." : "댓글 등록"}
            </button>
          </div>
          {errorMessage && (
            <p className="login-message login-message-error" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      ) : (
        <p className="comment-login-prompt">
          <Link href={`/login?redirectTo=/log/${logSlug}`}>로그인</Link> 후 댓글을 남길 수 있습니다.
        </p>
      )}
    </section>
  );
}
