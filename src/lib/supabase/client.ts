import { createBrowserClient } from "@supabase/ssr";

// 브라우저(Client Component)에서 Supabase를 호출할 때 사용하는 클라이언트입니다.
// NEXT_PUBLIC_ 접두사가 붙은 값만 브라우저 번들에 포함되므로 여기서는 공개 가능한 URL과 anon 키만 사용합니다.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
