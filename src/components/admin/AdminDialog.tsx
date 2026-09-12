"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 관리자 화면 공용 모달 창입니다. 브라우저 기본 <dialog> 태그를 사용해서
 * 포커스 가두기(focus trap), Esc로 닫기, 화면 스크롤 잠금을 별도 라이브러리 없이 처리합니다.
 * 열림·닫힘 상태는 부모가 들고 있고(open/onClose), 이 컴포넌트는 그 상태를 실제 <dialog>에 반영만 합니다.
 */
export function AdminDialog({
  open,
  onClose,
  title,
  children,
  titleId,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 같은 페이지에 여러 다이얼로그가 있을 때 겹치지 않는 id를 넘겨줍니다. */
  titleId: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="admin-dialog"
      aria-labelledby={titleId}
      // Esc 키는 'cancel' 이벤트를 먼저 발생시킨 뒤 'close'가 따라옵니다. 두 경우 모두 같은 방식으로 닫습니다.
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        // <dialog> 자기 자신(반투명 배경 부분)을 클릭했을 때만 닫고, 안쪽 콘텐츠 클릭은 그대로 둡니다.
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="admin-dialog-panel">
        <header className="admin-dialog-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="admin-dialog-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </header>
        <div className="admin-dialog-body">{children}</div>
      </div>
    </dialog>
  );
}
