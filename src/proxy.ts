import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_LAST_ACTIVE_COOKIE,
  ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS,
  ADMIN_SESSION_COOKIE_NAMES,
  ADMIN_SESSION_STARTED_COOKIE,
  getAdminSessionTimeoutReason,
  type AdminSessionTimeoutReason,
} from "@/lib/auth/admin-session";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16에서는 middleware.ts가 proxy.ts로 이름이 바뀌었습니다 (동작은 동일).
// matcher에 걸린 요청만 이 함수를 거칩니다. 로그인 확인이 필요한 /admin 경로만 대상으로 좁혀서,
// 홈·Projects·Log 같은 공개 페이지가 방문할 때마다 불필요하게 Supabase를 한 번 더 왕복하지 않게 합니다
// (이 왕복 하나가 Supabase 리전과 거리 때문에 방문자 체감 속도에 수백 ms를 더했던 원인이었습니다).
// 다만 "관리자인지"(isAdminUser)까지는 여기서 확인하지 않습니다 — Next.js 공식 문서도
// Proxy만 믿지 말고 실제 서버 코드에서 다시 권한을 확인하라고 안내합니다.
//
// Supabase 리프레시 토큰은 기본적으로 만료 시간이 없어서, 로그인 한 번으로 사실상 무기한
// 로그인이 유지됩니다. 자리를 비운 채 관리자 화면을 열어두는 상황을 줄이기 위해
// 이 Proxy에서 자체적으로 두 가지 시간 제한을 둡니다.
// - IDLE: 이 시간 동안 /admin 요청이 없으면 자리를 비운 것으로 보고 로그아웃합니다.
// - ABSOLUTE: 처음 로그인한 뒤 이 시간이 지나면 계속 활동 중이어도 다시 로그인하게 합니다.
/** 세션 갱신 응답에 포함된 Set-Cookie를 리다이렉트 응답에도 빠짐없이 옮깁니다. */
function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
}

/** 관리자 시간 추적 쿠키를 삭제해 다음 로그인이 이전 세션 시각을 물려받지 않게 합니다. */
function clearAdminSessionCookies(response: NextResponse) {
  ADMIN_SESSION_COOKIE_NAMES.forEach((name) => response.cookies.delete(name));
}

/** 기존 Supabase 쿠키 변경을 보존하면서 로그인 화면으로 보내는 공통 응답을 만듭니다. */
function createLoginRedirect(
  request: NextRequest,
  sessionResponse: NextResponse,
  reason?: AdminSessionTimeoutReason,
  clearTrackingCookies = true,
) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  if (reason) {
    loginUrl.searchParams.set("reason", reason);
  }

  // 활동 신호는 POST 요청일 수 있으므로 303으로 로그인 페이지의 GET 요청으로 전환합니다.
  const redirectResponse = NextResponse.redirect(loginUrl, 303);
  copyResponseCookies(sessionResponse, redirectResponse);
  if (clearTrackingCookies) {
    clearAdminSessionCookies(redirectResponse);
  }
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);

  if (!user) {
    return createLoginRedirect(request, response);
  }

  const now = Date.now();
  const lastActiveValue = request.cookies.get(ADMIN_LAST_ACTIVE_COOKIE)?.value;
  const sessionStartedValue = request.cookies.get(ADMIN_SESSION_STARTED_COOKIE)?.value;
  const timeoutReason = getAdminSessionTimeoutReason({
    now,
    lastActiveValue,
    sessionStartedValue,
  });

  if (timeoutReason) {
    // 실제 Supabase 세션도 끝내서, 쿠키를 지운 뒤 다음 /admin 요청이 다시 로그인 화면으로 가게 합니다.
    // 기본값(global)은 다른 기기 세션까지 모두 종료하므로 자동 만료에는 현재 세션만 대상으로 합니다.
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.error("관리자 세션 자동 로그아웃 실패:", error.message);
    }

    // Supabase 로그아웃이 실패했다면 만료된 타임스탬프를 남겨 다음 /admin 요청도 계속 차단합니다.
    // 성공했을 때만 추적 쿠키까지 지워 새 로그인이 새 세션 시각으로 시작되게 합니다.
    return createLoginRedirect(request, response, timeoutReason, !error);
  }

  // 정상 요청이면 "마지막 활동 시각"을 매번 갱신하고, 세션이 처음 시작된 시각은 유지합니다.
  const cookieBase = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  response.cookies.set(ADMIN_LAST_ACTIVE_COOKIE, String(now), {
    ...cookieBase,
    maxAge: ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  response.cookies.set(ADMIN_SESSION_STARTED_COOKIE, sessionStartedValue ?? String(now), {
    ...cookieBase,
    maxAge: ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

export const config = {
  // /admin 아래 경로만 로그인 확인이 필요합니다. 공개 페이지는 이 Proxy를 아예 거치지 않습니다.
  matcher: ["/admin/:path*"],
};
