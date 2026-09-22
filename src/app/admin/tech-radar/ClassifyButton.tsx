"use client";

import { useState, useTransition } from "react";
import { classifyStoredArticles } from "./actions";

/** 마이그레이션 이전에 저장된 글도 삭제 없이 현재의 무료 키워드 규칙으로 분류합니다. */
export function ClassifyButton() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div>
      <button
        className="admin-action-button admin-action-outline"
        disabled={isPending}
        type="button"
        onClick={() => {
          setErrorMessage(null);
          startTransition(async () => {
            try {
              await classifyStoredArticles();
            } catch (error) {
              setErrorMessage(error instanceof Error ? error.message : "글을 분류하지 못했습니다.");
            }
          });
        }}
      >
        {isPending ? "분류 중..." : "기존 글 자동 분류"}
      </button>
      {errorMessage && <p className="admin-error-message">{errorMessage}</p>}
    </div>
  );
}
