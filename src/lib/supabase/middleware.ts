import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// proxy.ts에서 호출하는 세션 갱신 로직입니다.
// Supabase 로그인 세션은 만료 시간이 있는 토큰이라, 매 요청마다 여기서 검사해서
// 곧 만료될 세션을 자동으로 갱신하고 새 쿠키를 응답에 실어 보냅니다.
// 이 작업을 안 하면 로그인이 예고 없이 풀리는 문제가 생길 수 있습니다.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser()는 Supabase 서버에 토큰을 검증받는 호출이라, 세션이 곧 만료되면
  // 여기서 자동으로 갱신된 토큰이 위 setAll을 통해 쿠키에 반영됩니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
