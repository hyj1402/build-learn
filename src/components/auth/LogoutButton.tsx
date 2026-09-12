import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 폼 제출로 Server Action을 실행하는 방식이라 이 컴포넌트 자체는 Server Component로 둘 수 있습니다.
// (버튼 클릭 이벤트를 JS로 직접 처리하지 않고, 폼 submit을 서버가 처리합니다.)
/** 로그인 세션을 종료하는 버튼입니다. className으로 페이지마다 같은 동작에 다른 모양을 적용할 수 있습니다. */
export function LogoutButton({ className = "text-link" }: { className?: string }) {
  async function logout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <form action={logout}>
      <button type="submit" className={className}>
        로그아웃
      </button>
    </form>
  );
}
