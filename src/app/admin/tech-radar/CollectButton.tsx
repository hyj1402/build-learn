"use client";

import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { collectAllSources, collectSource } from "./actions";

/** 소스 하나 또는 전체를 지금 수집합니다. 실수로 누르는 걸 막기 위해 확인 창을 거칩니다. */
export function CollectButton({
  sourceId,
  label,
  className = "admin-action-button admin-action-outline",
}: {
  sourceId?: string;
  label: string;
  className?: string;
}) {
  return (
    <AdminConfirmButton
      label={label}
      triggerClassName={className}
      confirmTitle={sourceId ? `${label}할까요?` : "전체 소스를 지금 수집할까요?"}
      confirmDescription="RSS를 읽어와 새 글만 추가합니다. 이미 가져온 글은 다시 추가되지 않습니다."
      confirmLabel="수집하기"
      confirmClassName={className}
      onConfirm={() => (sourceId ? collectSource(sourceId) : collectAllSources())}
    />
  );
}
