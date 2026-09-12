"use server";

import { after } from "next/server";
import { CONTACT_LIMITS, EMAIL_REGEX } from "@/lib/contact";
import { notifyNewContactMessage } from "@/lib/notify";
import { createClient } from "@/lib/supabase/server";

// 폼 제출 결과를 화면에 돌려주기 위한 상태 값입니다. useActionState가 이 값을 그대로 받습니다.
// values를 함께 돌려주는 이유: React 19는 form action이 끝나면 폼을 자동으로 초기화하므로,
// 오류일 때 입력값을 돌려주지 않으면 사용자가 쓴 내용이 사라집니다.
export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  values: { name: string; email: string; message: string };
};

const EMPTY_VALUES = { name: "", email: "", message: "" };

/**
 * Contact 폼을 받아 문의 내용을 contact_messages 테이블에 저장합니다.
 * 이메일 발송 대신 DB에 남기는 이유는 발송 실패·스팸 분류로 문의가 사라지지 않게 하기 위해서입니다.
 * useActionState와 함께 쓰므로 첫 번째 인자로 이전 상태를 받습니다(값은 사용하지 않습니다).
 */
export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // 사람 눈에 보이지 않는 입력칸입니다. 자동 입력 봇은 모든 칸을 채우므로 값이 있으면 봇으로 간주합니다.
  // 봇에게 실패를 알리면 우회를 시도하므로, 성공한 것처럼 응답하고 저장만 하지 않습니다.
  if (String(formData.get("website") ?? "").trim().length > 0) {
    return {
      status: "success",
      message: "메시지를 보냈습니다. 확인 후 회신드리겠습니다.",
      values: EMPTY_VALUES,
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const values = { name, email, message };

  // 브라우저 검증은 개발자 도구로 쉽게 우회할 수 있으므로 서버에서 같은 규칙을 다시 확인합니다.
  const fail = (text: string): ContactFormState => ({ status: "error", message: text, values });

  if (!name || !email || !message) {
    return fail("이름, 이메일, 메시지를 모두 입력해주세요.");
  }
  if (name.length > CONTACT_LIMITS.name.max) {
    return fail(`이름은 ${CONTACT_LIMITS.name.max}자 이내로 입력해주세요.`);
  }
  if (email.length > CONTACT_LIMITS.email.max || !EMAIL_REGEX.test(email)) {
    return fail("이메일 형식을 확인해주세요. 예: name@example.com");
  }
  if (message.length < CONTACT_LIMITS.message.min) {
    return fail(`메시지는 ${CONTACT_LIMITS.message.min}자 이상 입력해주세요.`);
  }
  if (message.length > CONTACT_LIMITS.message.max) {
    return fail(`메시지는 ${CONTACT_LIMITS.message.max}자 이내로 입력해주세요.`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({ name, email, message });

  if (error) {
    return fail("메시지를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  // 저장이 끝난 뒤에만 알림을 보냅니다. after()는 방문자에게 응답을 먼저 보내고 나서 실행하므로
  // 메일 전송을 기다리느라 폼이 느려지지 않고, 알림이 실패해도 이미 저장된 문의에는 영향이 없습니다.
  after(() => notifyNewContactMessage({ name, email, message }));

  return {
    status: "success",
    message: "메시지를 보냈습니다. 확인 후 회신드리겠습니다.",
    values: EMPTY_VALUES,
  };
}
