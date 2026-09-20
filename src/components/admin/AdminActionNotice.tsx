"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ActionNotice } from "@/components/ui/ActionNotice";

// URL에는 짧은 코드만 남기고, 실제 문구는 이 한 곳에서 관리해 오타와 임의 문구 노출을 막습니다.
const NOTICE_MESSAGES: Record<string, string> = {
  "log-saved": "학습 기록을 저장했습니다.",
  "project-saved": "프로젝트를 저장했습니다.",
};

/**
 * Server Action의 redirect URL에 담긴 완료 코드를 공통 토스트로 바꿉니다.
 * 한 번 보여준 뒤 URL에서 코드를 지워 새로고침이나 링크 복사 때 같은 알림이 반복되지 않게 합니다.
 */
export function AdminActionNotice() {
  const searchParams = useSearchParams();
  const noticeCode = searchParams.get("notice");
  const message = noticeCode ? (NOTICE_MESSAGES[noticeCode] ?? null) : null;

  useEffect(() => {
    if (!noticeCode || !message) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(window.history.state, "", url);
  }, [message, noticeCode]);

  // 같은 알림 코드라도 다른 화면에서 다시 저장했을 때 새 알림으로 시작하도록 key를 줍니다.
  return <ActionNotice key={noticeCode ?? "empty"} message={message} />;
}
