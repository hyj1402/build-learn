"use client";

import { useTransition } from "react";
import { dismissArticle } from "./actions";

/** 삭제가 아니라 목록에서 걸러내는 것뿐이라(언제든 되돌릴 수 있음) 확인 창 없이 바로 처리합니다. */
export function DismissButton({ articleId }: { articleId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="admin-action-button admin-action-ghost"
      disabled={isPending}
      onClick={() => startTransition(() => dismissArticle(articleId))}
    >
      관심없음
    </button>
  );
}
