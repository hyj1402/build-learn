"use client";

import { useEffect } from "react";

/**
 * 루트 layout.tsx 자체가 렌더에 실패하는 극히 드문 경우를 위한 최후의 안전망입니다.
 * 이 파일은 루트 layout 전체를 대신하므로 직접 <html>/<body>를 그려야 합니다.
 * 평소에는 위의 error.tsx(공개 사이트)·admin/error.tsx(관리자)가 먼저 잡아내므로,
 * 이 화면은 그 두 곳조차 못 뜰 만큼 근본적인 문제일 때만 보입니다 — 그래서 사이트 CSS에 기대지 않고
 * 최소한의 인라인 스타일만으로 항상 읽히게 만들었습니다.
 */
export default function GlobalError({
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
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#f5f5f5",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ letterSpacing: "0.1em", opacity: 0.6, marginBottom: "0.5rem" }}>
            ERROR / 500
          </p>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            사이트를 불러오지 못했습니다.
          </h1>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.6rem 1.2rem",
              background: "transparent",
              color: "#f5f5f5",
              border: "1px solid #f5f5f5",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
