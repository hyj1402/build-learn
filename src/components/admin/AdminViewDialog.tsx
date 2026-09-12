"use client";

import { useId, useState, type ReactNode } from "react";
import { AdminDialog } from "./AdminDialog";

/**
 * 표 안에 다 담기 힘든 긴 내용을 "자세히 보기" 버튼으로 열어보는 다이얼로그입니다.
 * (예: 문의 수신함의 긴 메시지 본문)
 */
export function AdminViewDialog({
  triggerLabel,
  title,
  children,
}: {
  triggerLabel: ReactNode;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button type="button" className="admin-view-trigger" onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>
      <AdminDialog open={open} onClose={() => setOpen(false)} title={title} titleId={titleId}>
        <div className="admin-dialog-content">{children}</div>
      </AdminDialog>
    </>
  );
}
