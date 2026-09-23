"use client";

import { useEffect } from "react";
import { trackPublicContentView, recordContentViewEvent } from "@/app/(site)/view-actions";

const VIEW_DEDUPLICATION_MS = 24 * 60 * 60 * 1000;
const VISITOR_ID_KEY = "build-learn:visitor-id";

/** 같은 브라우저를 다시 구분하기 위한 임의 UUID를 읽거나, 없으면 하나 만들어 저장합니다. */
function getOrCreateVisitorId(): string {
  const existing = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const created = crypto.randomUUID();
  window.localStorage.setItem(VISITOR_ID_KEY, created);
  return created;
}

/**
 * 방문 경로 통계에는 어느 사이트에서 왔는지만 필요합니다. 검색어·게시글 경로 같은 URL의
 * 나머지 부분은 받지 않도록 브라우저 단계에서 먼저 도메인만 추립니다.
 */
function getReferrerHost(): string | null {
  if (!document.referrer) return null;

  try {
    const url = new URL(document.referrer);
    return url.protocol === "http:" || url.protocol === "https:" ? url.hostname : null;
  } catch {
    return null;
  }
}

/**
 * 같은 브라우저가 같은 공개 글을 24시간 안에 다시 열면 조회수를 올리지 않는 보이지 않는 컴포넌트입니다.
 * 방문자 이름·로그인 ID·IP는 저장하지 않고, 브라우저 안의 시간값과 임의 방문자 UUID만 사용합니다.
 * 같은 24시간 판정을 통과했을 때만 관리자 전용 방문 로그(`content_view_events`)에도 한 줄 남깁니다 —
 * 새로고침·재방문마다 로그가 쌓이지 않고, "실제로 새로 읽은 시점"만 기록됩니다.
 */
export function ContentViewTracker({ kind, slug }: { kind: "log" | "project"; slug: string }) {
  useEffect(() => {
    const storageKey = `build-learn:view:${kind}:${slug}`;
    const now = Date.now();

    function recordView() {
      const visitorId = getOrCreateVisitorId();
      const referrer = getReferrerHost();
      void trackPublicContentView(kind, slug).catch(() => {
        window.localStorage.removeItem(storageKey);
      });
      void recordContentViewEvent(kind, slug, visitorId, referrer);
    }

    try {
      const lastViewedAt = Number(window.localStorage.getItem(storageKey));
      if (Number.isFinite(lastViewedAt) && now - lastViewedAt < VIEW_DEDUPLICATION_MS) return;

      // 먼저 기록해 같은 탭에서 React가 다시 렌더링되어도 요청이 겹치지 않게 합니다.
      window.localStorage.setItem(storageKey, String(now));
      recordView();
    } catch {
      // 저장소를 막은 브라우저에서도 본문은 정상 표시하고, 조회수만 기존처럼 요청합니다.
      // 이 경로는 visitorId를 저장할 수 없으므로 방문 로그는 남기지 않고 조회수만 올립니다.
      void trackPublicContentView(kind, slug);
    }
  }, [kind, slug]);

  return null;
}
