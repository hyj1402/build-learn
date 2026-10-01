"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_IDLE_TIMEOUT_MS } from "@/lib/auth/admin-session";

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
const IDLE_CHECK_INTERVAL_MS = 60 * 1000;

/**
 * 관리자 화면의 실제 키보드·포인터·스크롤 활동을 감지합니다.
 * 활동 중에는 최대 5분에 한 번만 가벼운 요청을 보내 서버의 마지막 활동 시각을 갱신하고,
 * 30분 동안 아무 활동도 없으면 보호된 경로를 다시 열어 Proxy가 세션을 안전하게 종료하게 합니다.
 */
export function AdminSessionActivity() {
  const router = useRouter();

  useEffect(() => {
    let lastActivityAt = Date.now();
    let lastHeartbeatAt = Date.now();
    let isRedirecting = false;

    async function sendHeartbeat() {
      try {
        const response = await fetch("/admin/session/activity", {
          method: "POST",
          cache: "no-store",
        });

        // 세션이 이미 만료됐다면 Proxy의 로그인 리다이렉트를 현재 화면에도 반영합니다.
        if (response.redirected && response.url.includes("/login")) {
          isRedirecting = true;
          const loginUrl = new URL(response.url);
          router.replace(`${loginUrl.pathname}${loginUrl.search}`);
        }
      } catch {
        // 일시적인 네트워크 실패만으로 작성 화면을 막지 않습니다.
        // 다음 활동이나 실제 저장 요청에서 Proxy가 세션을 다시 확인합니다.
      }
    }

    function recordActivity() {
      const now = Date.now();
      lastActivityAt = now;

      if (!isRedirecting && now - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
        lastHeartbeatAt = now;
        void sendHeartbeat();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        recordActivity();
      }
    }

    const idleTimer = window.setInterval(() => {
      if (!isRedirecting && Date.now() - lastActivityAt >= ADMIN_IDLE_TIMEOUT_MS) {
        isRedirecting = true;
        // 직접 토큰을 지우지 않고 현재 보호 화면을 새로 요청해 Proxy의 로그아웃·쿠키 정리를 사용합니다.
        router.refresh();
      }
    }, IDLE_CHECK_INTERVAL_MS);

    const activityEvents: (keyof WindowEventMap)[] = [
      "keydown",
      "pointerdown",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, recordActivity, { passive: true }),
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(idleTimer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return null;
}
