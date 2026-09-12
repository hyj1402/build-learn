"use client";

import { createClient } from "@/lib/supabase/client";

// 클릭 이벤트를 처리해야 해서 Client Component입니다 (Server Component는 onClick을 가질 수 없습니다).
export function GoogleLoginButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // 로그인 성공 후 /auth/callback으로 돌아오고, 거기서 다시 원래 페이지(redirectTo)로 이동합니다.
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });
  };

  return (
    <button type="button" className="login-google-button" onClick={handleLogin}>
      <span aria-hidden="true" className="login-google-mark">
        G
      </span>
      Google로 계속하기
    </button>
  );
}
