"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Header는 모든 페이지가 공유하는 Server Component라 여기서 로그인 여부를 서버에서 확인하면
// 지금 정적으로 미리 생성되는 Home/About 같은 페이지까지 전부 매 요청 렌더링으로 바뀝니다.
// 그래서 이 링크만 별도 Client Component로 분리해 브라우저에서 로그인 여부를 확인합니다.
// (실제 관리자인지는 어차피 /admin 레이아웃이 다시 검사하므로, 여기서는 "로그인 여부"만 봐도 안전합니다.)
export function AuthNavLink() {
  // null = 아직 확인 중. 로그인 상태를 알기 전까지는 아무것도 안 보여줘서,
  // 이미 로그인된 사람 화면에 "로그인" 링크가 잠깐 나타났다 사라지는 깜빡임을 막습니다.
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

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

  if (isSignedIn === null) {
    return null;
  }

  // 로그인 전에는 매번 주소창에 /login을 직접 치지 않도록 메뉴에 로그인 링크를 보여줍니다.
  if (!isSignedIn) {
    return <Link href="/login">로그인</Link>;
  }

  return <Link href="/admin">Admin</Link>;
}
