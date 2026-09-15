"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Header는 모든 페이지가 공유하는 Server Component라 여기서 로그인 여부를 서버에서 확인하면
// 지금 정적으로 미리 생성되는 Home/About 같은 페이지까지 전부 매 요청 렌더링으로 바뀝니다.
// 그래서 이 링크만 별도 Client Component로 분리해 브라우저에서 로그인 여부를 확인합니다.
//
// "Admin" 글자는 실제 관리자(사이트 소유자)에게만 보여야 하므로, 로그인 여부뿐 아니라
// user_roles 테이블에서 이 사람의 role도 함께 확인합니다.
// (user_roles의 RLS 정책은 "자기 자신의 role만" 읽을 수 있게 되어 있어 여기서 조회해도 안전합니다.
//  /admin 진입 자체는 어차피 서버(admin/layout.tsx)가 다시 한번 검사하므로 이중으로 안전합니다.)
export function AuthNavLink() {
  // null = 아직 확인 중. 상태를 알기 전까지는 아무것도 안 보여줘서,
  // "로그인"이나 "Admin" 링크가 잠깐 나타났다 사라지는 깜빡임을 막습니다.
  const [status, setStatus] = useState<"loading" | "signedOut" | "member" | "admin">("loading");

  useEffect(() => {
    const supabase = createClient();

    async function resolveStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("signedOut");
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      setStatus(data?.role === "admin" ? "admin" : "member");
    }

    resolveStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      resolveStatus();
    });
    return () => subscription.unsubscribe();
  }, []);

  if (status === "loading") {
    return null;
  }

  // 로그인 전에는 매번 주소창에 /login을 직접 치지 않도록 메뉴에 로그인 링크를 보여줍니다.
  if (status === "signedOut") {
    return <Link href="/login">로그인</Link>;
  }

  // 로그인은 했지만 관리자가 아닌 일반 회원: 아직 회원 전용 페이지가 없어 별도 링크를 보여주지 않습니다.
  if (status === "member") {
    return null;
  }

  return <Link href="/admin">Admin</Link>;
}
