import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google 로그인이 끝나면 Supabase가 이 주소로 리다이렉트하면서 code 쿼리 값을 함께 보냅니다.
// (Google Cloud Console에는 Supabase 콜백 주소를 등록했고, 이 주소는 그 뒤에
// Supabase가 다시 우리 앱으로 돌려보낼 때 쓰는 주소입니다: Supabase Dashboard의
// Redirect URLs에 등록되어 있어야 합니다.)
// code를 실제 로그인 세션으로 교환해서 쿠키에 저장하는 역할을 합니다.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 로그인 버튼을 누르기 전 있던 페이지로 되돌아가기 위한 값입니다 (proxy.ts가 /login으로 보낼 때 함께 담음).
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // code가 없거나 교환에 실패하면 로그인 실패 안내와 함께 로그인 페이지로 되돌아갑니다.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
