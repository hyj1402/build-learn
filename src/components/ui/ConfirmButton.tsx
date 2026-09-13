"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";

/**
 * 삭제처럼 되돌리기 어려운 작업 전에 한 번 더 확인받는 버튼입니다.
 * /admin의 AdminConfirmButton과 같은 방식(브라우저 기본 <dialog> 태그로 포커스 가두기·Esc 닫기를
 * 처리)을 공개 사이트 디자인 톤에 맞춰 다시 만든 것입니다. window.confirm() 대신 이걸 쓰면
 * 버튼 스타일·설명 문구를 사이트 디자인에 맞게 보여줄 수 있습니다.
 */
export function ConfirmButton({
  label = "삭제",
  triggerClassName = "comment-delete",
  confirmTitle = "정말 삭제할까요?",
  confirmDescription = "이 작업은 되돌릴 수 없습니다.",
  confirmLabel = "삭제하기",
  onConfirm,
}: {
  label?: string;
  triggerClassName?: string;
  confirmTitle?: string;
  confirmDescription?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {label}
      </button>
      <dialog
        ref={dialogRef}
        className="confirm-dialog"
        aria-labelledby={titleId}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // <dialog> 자기 자신(반투명 배경)을 클릭했을 때만 닫고, 안쪽 콘텐츠 클릭은 그대로 둡니다.
          if (event.target === dialogRef.current) setOpen(false);
        }}
      >
        <div className="confirm-dialog-panel">
          <h2 id={titleId}>{confirmTitle}</h2>
          <p>{confirmDescription}</p>
          <div className="confirm-dialog-actions">
            <button
              type="button"
              className="confirm-dialog-cancel"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              취소
            </button>
            <button
              type="button"
              className="confirm-dialog-confirm"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await onConfirm();
                  setOpen(false);
                });
              }}
            >
              {isPending ? "처리 중..." : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
