"use client";

// 제출 결과(성공·오류 메시지)와 글자 수 표시를 화면에서 처리해야 하므로 Client Component로 실행합니다.
// 저장 자체는 Server Action이 서버에서 처리하므로, 브라우저에는 DB 접근 코드가 내려가지 않습니다.

import { useActionState, useState } from "react";
import { submitContactMessage, type ContactFormState } from "@/app/(site)/contact/actions";
import { CONTACT_LIMITS, EMAIL_PATTERN } from "@/lib/contact";

const initialState: ContactFormState = {
  status: "idle",
  message: "",
  values: { name: "", email: "", message: "" },
};

export function ContactForm() {
  // useActionState는 Server Action을 폼에 연결하고, 액션이 반환한 상태와 진행 여부를 함께 돌려줍니다.
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);
  // 남은 글자 수를 보여주려면 입력 중인 값을 알아야 해서 메시지 칸만 상태로 관리합니다.
  const [message, setMessage] = useState("");

  // 제출이 끝나면 React 19는 폼을 자동으로 초기화합니다. 성공했을 땐 빈 값이, 실패했을 땐 쓰던 값이
  // 서버에서 돌아오므로 글자 수 표시도 그 값에 맞춰야 합니다.
  // effect에서 setState를 하면 렌더가 두 번 도므로, React가 권장하는 "렌더 중 상태 조정" 방식을 씁니다.
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setMessage(state.values.message);
  }

  const messageLength = message.length;
  // 남은 글자가 10%보다 적게 남으면 색으로 미리 알려줍니다.
  const isNearLimit = messageLength > CONTACT_LIMITS.message.max * 0.9;

  return (
    <form className="contact-form" action={formAction}>
      <label>
        이름
        <input
          required
          name="name"
          maxLength={CONTACT_LIMITS.name.max}
          autoComplete="name"
          defaultValue={state.values.name}
          placeholder="홍길동"
        />
      </label>

      <label>
        이메일
        <input
          required
          type="email"
          name="email"
          // type="email"만으로는 "a@b"처럼 점 없는 주소도 통과하므로 DB와 같은 규칙을 한 번 더 검사합니다.
          pattern={EMAIL_PATTERN}
          maxLength={CONTACT_LIMITS.email.max}
          autoComplete="email"
          defaultValue={state.values.email}
          placeholder="name@example.com"
          title="name@example.com 형식으로 입력해주세요."
        />
      </label>

      <label>
        메시지
        <textarea
          required
          name="message"
          minLength={CONTACT_LIMITS.message.min}
          maxLength={CONTACT_LIMITS.message.max}
          rows={7}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-describedby="message-counter"
          placeholder={`${CONTACT_LIMITS.message.min}자 이상 자유롭게 작성해주세요.`}
        />
      </label>

      {/* aria-describedby로 메시지 칸과 연결해, 화면 낭독기 사용자도 입력 전에 제한을 알 수 있게 합니다. */}
      <p
        id="message-counter"
        className="contact-counter"
        style={isNearLimit ? { color: "var(--accent)" } : undefined}
      >
        {messageLength.toLocaleString()} / {CONTACT_LIMITS.message.max.toLocaleString()}자
      </p>

      {/* 사람에게는 보이지 않고 자동 입력 봇만 채우는 함정(honeypot) 입력칸입니다.
          스크린 리더와 키보드 사용자에게도 노출되지 않도록 aria-hidden과 tabIndex를 함께 지정합니다. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <button type="submit" disabled={isPending}>
        {isPending ? "보내는 중..." : "메시지 보내기 →"}
      </button>

      {state.status !== "idle" && (
        <p role="status" style={state.status === "error" ? { color: "var(--accent)" } : undefined}>
          {state.message}
        </p>
      )}
    </form>
  );
}
