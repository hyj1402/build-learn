import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Component와 Server Action에서 Supabase를 호출할 때 사용하는 클라이언트입니다.
// 로그인 세션은 쿠키에 저장되므로, Next.js의 cookies()로 요청에 담긴 쿠키를 읽고 써야 로그인 상태가 유지됩니다.
// Next.js 16에서는 cookies()가 Promise이므로 이 함수도 async로 만들고 await으로 읽습니다.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서는 쿠키를 쓸 수 없습니다. 세션 갱신은 미들웨어가 담당하므로 여기서는 무시합니다.
          }
        },
      },
    },
  );
}
