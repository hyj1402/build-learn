"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Header는 모든 페이지가 공유하는 Server Component라 여기서 로그인 여부를 서버에서 확인하면
// 지금 정적으로 미리 생성되는 Home/About 같은 페이지까지 전부 매 요청 렌더링으로 바뀝니다.
// 그래서 이 링크만 별도 Client Component로 분리해 브라우저에서 로그인 여부를 확인합니다.
// (실제 관리자인지는 어차피 /admin 레이아웃이 다시 검사하므로, 여기서는 "로그인 여부"만 봐도 안전합니다.)
export function AdminNavLink() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsSignedIn(!!data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!isSignedIn) {
    return null;
  }

  return <Link href="/admin">Admin</Link>;
}
