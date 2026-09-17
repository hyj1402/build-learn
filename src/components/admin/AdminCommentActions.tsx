"use client";

import { useState, useTransition, type FormEvent } from "react";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { restoreComment, softDeleteComment, updateComment } from "@/app/admin/comments/actions";
import type { CommentContentType } from "@/app/admin/comments/actions";

const MAX_COMMENT_LENGTH = 1000;

/** 관리자 목록에서 댓글을 수정·소프트 삭제·복구하는 작은 작업 영역입니다. */
export function AdminCommentActions({
  commentId,
  initialBody,
  isDeleted,
  contentType,
}: {
  commentId: string;
  initialBody: string;
  isDeleted: boolean;
  contentType: CommentContentType;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(initialBody);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    const trimmed = body.trim();
    if (!trimmed) {
      setErrorMessage("댓글 내용을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      try {
        await updateComment(commentId, trimmed, contentType);
        setIsEditing(false);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "댓글을 수정하지 못했습니다.");
      }
    });
  }

  function handleRestore() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await restoreComment(commentId, contentType);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "댓글을 복구하지 못했습니다.");
      }
    });
  }

  if (isDeleted) {
    return (
      <div className="admin-comment-actions">
        <button
          className="admin-action-button admin-action-outline"
          type="button"
          onClick={handleRestore}
          disabled={isPending}
        >
          {isPending ? "복구 중..." : "복구"}
        </button>
        {errorMessage && (
          <p className="admin-comment-action-error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="admin-comment-actions">
      {isEditing ? (
        <form className="admin-comment-edit-form" onSubmit={handleUpdate}>
          <label className="sr-only" htmlFor={`admin-comment-${commentId}`}>
            댓글 수정
          </label>
          <textarea
            id={`admin-comment-${commentId}`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            disabled={isPending}
          />
          <div>
            <span>
              {body.length} / {MAX_COMMENT_LENGTH}
            </span>
            <button
              type="button"
              className="admin-action-button admin-action-ghost"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              취소
            </button>
            <button type="submit" className="admin-action-button" disabled={isPending}>
              {isPending ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      ) : (
        <div className="admin-row-actions">
          <button
            className="admin-action-button admin-action-outline admin-row-action-button"
            type="button"
            onClick={() => setIsEditing(true)}
          >
            수정
          </button>
          <AdminConfirmButton
            confirmTitle="이 댓글을 삭제할까요?"
            confirmDescription="일반 사용자에게는 숨겨지지만, 관리자 화면에서는 계속 확인하고 복구할 수 있습니다."
            onConfirm={softDeleteComment.bind(null, commentId, contentType)}
            triggerClassName="admin-action-button admin-action-outline-danger admin-row-action-button"
          />
        </div>
      )}
      {errorMessage && (
        <p className="admin-comment-action-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
