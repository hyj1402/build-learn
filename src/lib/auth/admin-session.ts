/** 관리자 화면의 서버 요청이 이 시간 동안 없으면 현재 로그인 세션을 종료합니다. */
export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

/** 관리자 화면을 계속 사용하더라도 이 시간이 지나면 다시 로그인해야 합니다. */
export const ADMIN_ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;

export const ADMIN_LAST_ACTIVE_COOKIE = "admin_last_active_at";
export const ADMIN_SESSION_STARTED_COOKIE = "admin_session_started_at";
export const ADMIN_SESSION_COOKIE_NAMES = [
  ADMIN_LAST_ACTIVE_COOKIE,
  ADMIN_SESSION_STARTED_COOKIE,
] as const;

// 판정 시각보다 추적 쿠키가 먼저 없어지면 오래된 세션을 새 세션으로 오인합니다.
// 브라우저의 일반적인 영구 쿠키 상한에 맞춰 충분히 오래 보관하고, 실제 만료는 아래 시간 차로 결정합니다.
export const ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

export type AdminSessionTimeoutReason = "idle" | "expired";

type AdminSessionTimestamps = {
  now: number;
  lastActiveValue?: string;
  sessionStartedValue?: string;
};

/**
 * 요청 쿠키의 타임스탬프로 관리자 세션 만료 사유를 판정합니다.
 * 두 쿠키가 모두 없으면 첫 관리자 요청으로 보지만, 하나만 없거나 값이 손상됐으면 우회로 보지 않고 만료시킵니다.
 */
export function getAdminSessionTimeoutReason({
  now,
  lastActiveValue,
  sessionStartedValue,
}: AdminSessionTimestamps): AdminSessionTimeoutReason | null {
  const hasLastActive = lastActiveValue !== undefined;
  const hasSessionStarted = sessionStartedValue !== undefined;

  if (!hasLastActive && !hasSessionStarted) {
    return null;
  }
  if (!hasLastActive) {
    return "idle";
  }
  if (!hasSessionStarted) {
    return "expired";
  }

  const lastActiveAt = Number(lastActiveValue);
  const sessionStartedAt = Number(sessionStartedValue);
  const hasInvalidTimestamp =
    !Number.isSafeInteger(lastActiveAt) ||
    !Number.isSafeInteger(sessionStartedAt) ||
    lastActiveAt <= 0 ||
    sessionStartedAt <= 0 ||
    lastActiveAt > now ||
    sessionStartedAt > now;

  if (hasInvalidTimestamp || now - sessionStartedAt >= ADMIN_ABSOLUTE_TIMEOUT_MS) {
    return "expired";
  }
  if (now - lastActiveAt >= ADMIN_IDLE_TIMEOUT_MS) {
    return "idle";
  }

  return null;
}
