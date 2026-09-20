"use client";

import { useEffect } from "react";

/**
 * /admin 아래 어떤 페이지가 던진 에러든 여기서 받습니다.
 * layout.tsx의 사이드바(admin-shell)는 이 파일과 무관하게 그대로 남아있고,
 * <main> 안쪽 내용만 이 화면으로 바뀝니다 — 에러가 나도 관리자 메뉴를 잃지 않습니다.
 * 관리자 본인만 보는 화면이라, 원인 파악에 도움이 되도록 에러 메시지를 그대로 보여줍니다
 * (Next.js가 프로덕션에서는 서버 에러 메시지를 이미 안전한 문구로 감춰서 내려주므로 노출 걱정은 없습니다).
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="admin-editor-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">ERROR / 500</p>
          <h1>문제가 발생했습니다.</h1>
          <p>{error.message || "요청을 처리하는 중 오류가 발생했습니다."}</p>
        </div>
      </header>
      <button type="button" className="admin-primary-action" onClick={() => reset()}>
        다시 시도
      </button>
    </div>
  );
}
