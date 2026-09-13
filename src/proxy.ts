import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16에서는 middleware.ts가 proxy.ts로 이름이 바뀌었습니다 (동작은 동일).
// matcher에 걸린 요청만 이 함수를 거칩니다. 로그인 확인이 필요한 /admin 경로만 대상으로 좁혀서,
// 홈·Projects·Log 같은 공개 페이지가 방문할 때마다 불필요하게 Supabase를 한 번 더 왕복하지 않게 합니다
// (이 왕복 하나가 Supabase 리전과 거리 때문에 방문자 체감 속도에 수백 ms를 더했던 원인이었습니다).
// 다만 "관리자인지"(isAdminUser)까지는 여기서 확인하지 않습니다 — Next.js 공식 문서도
// Proxy만 믿지 말고 실제 서버 코드에서 다시 권한을 확인하라고 안내합니다.
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // /admin 아래 경로만 로그인 확인이 필요합니다. 공개 페이지는 이 Proxy를 아예 거치지 않습니다.
  matcher: ["/admin/:path*"],
};
