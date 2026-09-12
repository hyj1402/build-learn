"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 이메일·비밀번호 로그인 양식입니다.
 * 입력된 비밀번호는 Supabase Auth에만 전달하며, 이 프로젝트 코드나 DB에 직접 저장하지 않습니다.
 */
export function EmailLoginForm({ redirectTo }: { redirectTo: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** 양식 제출 시 Supabase에 계정 검증을 요청하고, 성공하면 원래 보려던 페이지로 이동합니다. */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage("이메일 또는 비밀번호를 확인해주세요.");
      setIsSubmitting(false);
      return;
    }

    window.location.assign(redirectTo);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label htmlFor="email">이메일</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        required
      />

      <label htmlFor="password">비밀번호</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {message && (
        <p className="login-message login-message-error" role="alert">
          {message}
        </p>
      )}

      <button className="login-submit-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
