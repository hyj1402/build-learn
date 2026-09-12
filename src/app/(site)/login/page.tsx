import type { Metadata } from "next";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { EmailLoginForm } from "@/components/auth/EmailLoginForm";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "로그인" };

// 로그인 상태를 서버에서 확인해야 해서 Server Component입니다.
// 로그인 전에는 로그인 버튼을, 로그인 후에는 계정 정보와 로그아웃 버튼을 보여줍니다.
// 로그인한 사용자의 계정 정보와 user_roles에 저장된 현재 역할을 확인하는 용도로도 사용합니다.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-intro" aria-labelledby="login-title">
          <p className="eyebrow">BUILD &amp; LEARN</p>
          <h1 id="login-title">다시 만나서 반가워요.</h1>
          <p>
            기록을 관리하려면 로그인하세요. Google 계정 또는 이메일과 비밀번호로 계속할 수 있습니다.
          </p>
        </section>

        <section className="login-card" aria-label="로그인 양식">
          {error && (
            <p className="login-message login-message-error" role="alert">
              로그인에 실패했습니다. 다시 시도해주세요.
            </p>
          )}

          {user ? (
            <div className="login-account">
              <p className="eyebrow">SIGNED IN</p>
              <h2>{user.email}</h2>
              <dl>
                <div>
                  <dt>사용자 UUID</dt>
                  <dd>
                    <code>{user.id}</code>
                  </dd>
                </div>
                <div>
                  <dt>권한</dt>
                  <dd>{(await isAdminUser(user)) ? "관리자" : "일반 로그인 사용자"}</dd>
                </div>
              </dl>
              <LogoutButton />
            </div>
          ) : (
            <>
              <div className="login-card-heading">
                <h2>로그인</h2>
                <p>계정 정보를 입력해 주세요.</p>
              </div>
              <EmailLoginForm redirectTo={redirectTo ?? "/"} />
              <div className="login-divider" aria-hidden="true">
                <span>또는</span>
              </div>
              <GoogleLoginButton redirectTo={redirectTo ?? "/"} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
