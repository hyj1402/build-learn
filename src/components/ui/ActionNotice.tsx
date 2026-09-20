"use client";

import { useEffect, useState } from "react";

/**
 * 저장처럼 페이지 이동 뒤에도 알려야 하는 완료 결과를 잠시 보여주는 공통 알림입니다.
 * role=status는 화면을 보던 보조기술 사용자에게도 새 상태를 과도하게 방해하지 않고 전달합니다.
 */
export function ActionNotice({ message }: { message: string | null }) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!message) return;

    const timeoutId = window.setTimeout(() => setIsDismissed(true), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  if (!message || isDismissed) return null;

  return (
    <div className="action-notice" role="status">
      <span aria-hidden="true">✓</span>
      <p>{message}</p>
      <button aria-label="완료 알림 닫기" onClick={() => setIsDismissed(true)} type="button">
        닫기
      </button>
    </div>
  );
}
