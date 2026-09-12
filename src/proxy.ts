import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16에서는 middleware.ts가 proxy.ts로 이름이 바뀌었습니다 (동작은 동일).
// 모든 요청이 실제 페이지에 도달하기 전에 이 함수를 거칩니다.
// 여기서는 두 가지 일을 합니다: (1) 로그인 세션 쿠키 갱신, (2) /admin 경로에 비로그인 접근 차단.
// 다만 "관리자인지"(isAdminUser)까지는 여기서 확인하지 않습니다 — Next.js 공식 문서도
// Proxy만 믿지 말고 실제 서버 코드에서 다시 권한을 확인하라고 안내합니다.
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  if (isAdminPath && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 정적 파일·이미지 최적화·favicon 등은 세션 검사가 필요 없으므로 제외합니다.
     * 제외하지 않으면 CSS/이미지 요청마다 불필요하게 Supabase에 세션을 검증하게 됩니다.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
