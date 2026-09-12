"use client";

import { useId, useState, type ReactNode } from "react";
import { AdminDialog } from "./AdminDialog";

/**
 * 정보 전달용 알림 창입니다. 선택지 없이 "확인" 버튼 하나로 닫히는, 결과·안내 메시지에 씁니다.
 * 버튼을 직접 그리고 싶으면 trigger에 원하는 엘리먼트를 넘기고, 없으면 기본 버튼이 만들어집니다.
 */
export function AdminAlertDialog({
  trigger,
  triggerLabel = "알림 보기",
  triggerClassName = "admin-action-button admin-action-outline",
  title,
  children,
  confirmLabel = "확인",
}: {
  trigger?: (open: () => void) => ReactNode;
  triggerLabel?: string;
  triggerClassName?: string;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
          {triggerLabel}
        </button>
      )}
      <AdminDialog open={open} onClose={() => setOpen(false)} title={title} titleId={titleId}>
        <div className="admin-dialog-description">{children}</div>
        <div className="admin-dialog-actions">
          <button
            type="button"
            className="admin-action-button admin-action-outline"
            onClick={() => setOpen(false)}
          >
            {confirmLabel}
          </button>
        </div>
      </AdminDialog>
    </>
  );
}
