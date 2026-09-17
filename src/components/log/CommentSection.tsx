"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import type { ContentComment } from "@/lib/comments-db";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { addLogComment, deleteLogComment, updateLogComment } from "@/app/(site)/log/[slug]/actions";
import {
  addProjectComment,
  deleteProjectComment,
  updateProjectComment,
} from "@/app/(site)/projects/[slug]/actions";

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
 * Log·Project 상세 페이지 하단의 공용 댓글 목록·작성 폼입니다.
 * 로그인 여부와 관리자 여부는 서버 컴포넌트(page.tsx)에서 이미 확인해 props로 내려받습니다.
 */
export function CommentSection({
  contentType,
  contentSlug,
  initialComments,
  currentUserId,
  isAdmin,
}: {
  contentType: "log" | "project";
  contentSlug: string;
  initialComments: ContentComment[];
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const isProject = contentType === "project";
  const contentLabel = isProject ? "프로젝트" : "학습 기록";
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 브라우저 기본 required 팝업 대신, 우리 디자인에 맞는 안내 문구·테두리로 필수 입력을 알립니다.
  const [isDraftInvalid, setIsDraftInvalid] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!draft.trim()) {
      setIsDraftInvalid(true);
      setErrorMessage("댓글 내용을 입력해주세요.");
      return;
    }
    setIsDraftInvalid(false);

    const body = draft;
    startTransition(async () => {
      try {
        // 서버가 실제로 저장한 행(진짜 id 포함)을 그대로 받아 화면에 추가합니다.
        // 화면에서 임시 id를 지어내면, 등록 직후 바로 삭제할 때 존재하지 않는 id를 지우려다 에러가 났습니다.
        const newComment = isProject
          ? await addProjectComment(contentSlug, body)
          : await addLogComment(contentSlug, body);
        setDraft("");
        setComments((prev) => [...prev, newComment]);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "댓글을 남기지 못했습니다.");
      }
    });
  }

  async function handleDelete(commentId: string) {
    try {
      if (isProject) {
        await deleteProjectComment(commentId);
      } else {
        await deleteLogComment(commentId);
      }
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "댓글을 삭제하지 못했습니다.");
    }
  }

  /** 수정 버튼을 누른 댓글만 편집 상태로 바꿔, 목록에서 어떤 댓글을 고치는지 분명히 보여 줍니다. */
  function startEditing(comment: ContentComment) {
    setErrorMessage(null);
    setEditingCommentId(comment.id);
    setEditDraft(comment.body);
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>, commentId: string) {
    event.preventDefault();
    setErrorMessage(null);
    const body = editDraft.trim();
    if (!body) {
      setErrorMessage("댓글 내용을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      try {
        const updatedComment = isProject
          ? await updateProjectComment(commentId, body)
          : await updateLogComment(commentId, body);
        setComments((prev) =>
          prev.map((comment) => (comment.id === commentId ? updatedComment : comment)),
        );
        setEditingCommentId(null);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "댓글을 수정하지 못했습니다.");
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
                <div className="comment-item-dates">
                  <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
                  {comment.updatedAt && <span>수정됨 {formatCommentDate(comment.updatedAt)}</span>}
                </div>
              </div>
              {editingCommentId === comment.id ? (
                <form
                  className="comment-edit-form"
                  onSubmit={(event) => handleUpdate(event, comment.id)}
                >
                  <label className="sr-only" htmlFor={`comment-edit-${comment.id}`}>
                    댓글 수정
                  </label>
                  <textarea
                    id={`comment-edit-${comment.id}`}
                    value={editDraft}
                    onChange={(event) => setEditDraft(event.target.value)}
                    maxLength={MAX_COMMENT_LENGTH}
                    disabled={isPending}
                  />
                  <div className="comment-edit-actions">
                    <span>
                      {editDraft.length} / {MAX_COMMENT_LENGTH}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingCommentId(null)}
                      disabled={isPending}
                    >
                      취소
                    </button>
                    <button type="submit" disabled={isPending}>
                      {isPending ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </form>
              ) : (
                <p>{comment.body}</p>
              )}
              {(isAdmin || comment.authorId === currentUserId) && (
                <div className="comment-actions">
                  {editingCommentId !== comment.id && (
                    <button
                      type="button"
                      className="comment-delete"
                      onClick={() => startEditing(comment)}
                    >
                      수정
                    </button>
                  )}
                  <ConfirmButton
                    label="삭제"
                    triggerClassName="comment-delete"
                    confirmTitle="댓글을 삭제할까요?"
                    confirmDescription="일반 사용자에게는 숨겨지지만, 관리자는 계속 확인하고 복구할 수 있습니다."
                    onConfirm={() => handleDelete(comment.id)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {currentUserId ? (
        <form className="comment-form" onSubmit={handleSubmit} noValidate>
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (isDraftInvalid && event.target.value.trim()) setIsDraftInvalid(false);
            }}
            placeholder="댓글을 남겨보세요."
            maxLength={MAX_COMMENT_LENGTH}
            aria-invalid={isDraftInvalid}
            className={isDraftInvalid ? "is-invalid" : undefined}
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
          <Link href={`/login?redirectTo=/${isProject ? "projects" : "log"}/${contentSlug}`}>
            로그인
          </Link>{" "}
          후 {contentLabel}에 댓글을 남길 수 있습니다.
        </p>
      )}
    </section>
  );
}
