"use client";

import { useState, useTransition } from "react";
import { generateLogAiComment, saveLogAiComment } from "@/app/admin/ai-comment-actions";

/**
 * 저장된 Log에 붙일 "Claude의 코멘트"를 만들고 검토하는 관리자 전용 패널입니다.
 * 생성 결과는 입력창에만 채워지고 저장 버튼을 눌러야 공개됩니다. 그 전에 자유롭게 고치거나 지울 수 있습니다.
 * 글 작성 <form> 안에 넣으면 중첩 form이 되므로 수정 화면에서 폼 바깥에 둡니다.
 */
export function AiCommentPanel({
  logId,
  initialComment,
  isPublished,
}: {
  logId: string;
  initialComment: string;
  isPublished: boolean;
}) {
  const [comment, setComment] = useState(initialComment);
  const [savedComment, setSavedComment] = useState(initialComment);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setMessage(null);
    startTransition(async () => {
      const result = await generateLogAiComment(logId);
      if (result.status === "ok") {
        setComment(result.comment);
        setMessage({ type: "ok", text: "초안을 만들었습니다. 검토하고 고친 뒤 저장하세요." });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveLogAiComment(logId, comment);
      if (result.status === "ok") {
        setSavedComment(comment.trim());
        setMessage({
          type: "ok",
          text: comment.trim() ? "저장했습니다." : "코멘트를 삭제했습니다.",
        });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  }

  const hasUnsavedChanges = comment.trim() !== savedComment;

  return (
    <section className="ai-feedback" aria-labelledby="ai-comment-heading">
      <div className="ai-feedback-head">
        <div>
          <h3 id="ai-comment-heading">공개 AI 코멘트</h3>
          <p>
            저장된 본문을 Claude가 읽고 독자용 코멘트 초안을 씁니다. 저장해야 글 상세에
            &quot;Claude의 코멘트&quot;로 보입니다.
            {!isPublished && " (이 글이 공개 상태가 될 때부터 보입니다.)"}
          </p>
        </div>
        <button
          type="button"
          className="admin-action-button admin-action-outline-blue"
          onClick={handleGenerate}
          disabled={isPending}
        >
          {isPending ? "처리 중..." : comment ? "다시 생성" : "코멘트 생성"}
        </button>
      </div>

      <textarea
        aria-label="공개 AI 코멘트"
        className="ai-comment-input"
        rows={7}
        maxLength={3000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="생성 버튼을 누르거나 직접 입력하세요. 비우고 저장하면 코멘트가 삭제됩니다."
      />
      <div className="ai-comment-actions">
        <button
          type="button"
          className="admin-primary-action"
          onClick={handleSave}
          disabled={isPending || !hasUnsavedChanges}
        >
          {comment.trim() ? "코멘트 저장" : "코멘트 삭제"}
        </button>
        {message && (
          <p
            className={`login-message ${message.type === "error" ? "login-message-error" : ""}`}
            role={message.type === "error" ? "alert" : "status"}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
