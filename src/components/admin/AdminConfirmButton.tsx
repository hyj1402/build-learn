"use client";

import { useId, useState, useTransition } from "react";
import { AdminDialog } from "./AdminDialog";

/**
 * 삭제처럼 되돌리기 어려운 작업 전에 한 번 더 확인을 받는 버튼입니다.
 * onConfirm에 Server Action(필요하면 .bind()로 id를 고정한 것)을 그대로 넘기면,
 * "확인" 버튼을 눌렀을 때만 실제로 실행됩니다.
 */
export function AdminConfirmButton({
  label = "삭제",
  triggerClassName = "admin-delete-button",
  confirmTitle = "정말 삭제할까요?",
  confirmDescription = "이 작업은 되돌릴 수 없습니다.",
  confirmLabel = "삭제하기",
  confirmClassName = "admin-action-button admin-action-outline-danger",
  onConfirm,
}: {
  label?: string;
  triggerClassName?: string;
  confirmTitle?: string;
  confirmDescription?: string;
  confirmLabel?: string;
  confirmClassName?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const titleId = useId();

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {label}
      </button>
      <AdminDialog
        open={open}
        onClose={() => setOpen(false)}
        title={confirmTitle}
        titleId={titleId}
      >
        <p className="admin-dialog-description">{confirmDescription}</p>
        <div className="admin-dialog-actions">
          <button
            type="button"
            className="admin-action-button admin-action-ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            취소
          </button>
          <button
            type="button"
            className={confirmClassName}
            disabled={isPending}
            onClick={() => {
              // Server Action은 완료될 때까지 pending 상태를 알 수 있도록 useTransition으로 감쌉니다.
              startTransition(async () => {
                await onConfirm();
                setOpen(false);
              });
            }}
          >
            {isPending ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </AdminDialog>
    </>
  );
}
