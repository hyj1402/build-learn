"use client";

import { useTransition } from "react";
import { collectAllSources, collectSource } from "./actions";

/** 소스 하나 또는 전체를 지금 수집합니다. RSS 요청이 몇 초 걸릴 수 있어 진행 상태를 보여줍니다. */
export function CollectButton({
  sourceId,
  label,
  className = "admin-action-button admin-action-outline",
}: {
  sourceId?: string;
  label: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={className}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          if (sourceId) {
            await collectSource(sourceId);
          } else {
            await collectAllSources();
          }
        })
      }
    >
      {isPending ? "수집 중..." : label}
    </button>
  );
}
