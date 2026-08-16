"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        이름
        <input required name="name" autoComplete="name" />
      </label>
      <label>
        이메일
        <input required type="email" name="email" autoComplete="email" />
      </label>
      <label>
        메시지
        <textarea required name="message" rows={7} />
      </label>
      <button type="submit">메시지 준비하기 →</button>
      {sent && (
        <p role="status">
          현재는 UI 확인 단계입니다. 실제 이메일 전송은 발송 서비스를 정한 뒤 연결합니다.
        </p>
      )}
    </form>
  );
}
