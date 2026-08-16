"use client";

// 폼 제출 결과를 화면 상태로 보여주기 위해 Client Component로 실행합니다.

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  /** 현재는 실제 발송 대신 UI 동작만 확인합니다. 외부 발송 서비스를 연결할 때 이 함수를 교체합니다. */
  function submit(event: React.FormEvent<HTMLFormElement>) {
    // 브라우저의 기본 새로고침 제출을 막아 입력 화면을 그대로 유지합니다.
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
