"use client";

import { useState } from "react";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { classifyStoredArticles } from "./actions";

/** 마이그레이션 이전에 저장된 글도 삭제 없이 현재의 무료 키워드 규칙으로 분류합니다. */
export function ClassifyButton() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div>
      <AdminConfirmButton
        label="기존 글 자동 분류"
        triggerClassName="admin-action-button admin-action-outline"
        confirmTitle="검토 필요 글을 다시 분류할까요?"
        confirmDescription="아직 '검토 필요'로 남아있는 글만 현재 키워드 규칙으로 다시 분류합니다. 직접 지정한 분류는 바뀌지 않습니다."
        confirmLabel="분류하기"
        confirmClassName="admin-action-button admin-action-outline"
        onConfirm={async () => {
          setErrorMessage(null);
          try {
            await classifyStoredArticles();
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "글을 분류하지 못했습니다.");
          }
        }}
      />
      {errorMessage && <p className="admin-error-message">{errorMessage}</p>}
    </div>
  );
}
