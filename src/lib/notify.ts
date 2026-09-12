import { Resend } from "resend";

// 새 문의가 들어왔을 때 운영자에게 보내는 알림입니다.
// 알림은 "있으면 편한 것"이고 문의 보관이 본체이므로, 이 파일의 함수는 어떤 경우에도 예외를 밖으로 던지지 않습니다.
// (알림 실패가 방문자의 문의 전송 실패로 이어지면 안 됩니다.)

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_TO = process.env.CONTACT_NOTIFY_TO;
// 개인 도메인을 연결하기 전까지는 Resend가 제공하는 기본 발신 주소만 사용할 수 있습니다.
// 이 주소로는 Resend 계정 소유자 본인에게만 발송됩니다.
const NOTIFY_FROM = process.env.CONTACT_NOTIFY_FROM ?? "BUILD & LEARN <onboarding@resend.dev>";

type ContactMessage = { name: string; email: string; message: string };

/** 메일 본문에 넣기 전에 HTML 특수문자를 막아, 방문자가 입력한 값이 태그로 해석되지 않게 합니다. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 새 문의를 이메일로 알립니다.
 * 환경변수가 없으면 아무 일도 하지 않으므로, 알림을 설정하기 전에도 Contact 폼은 정상 동작합니다.
 */
export async function notifyNewContactMessage(contact: ContactMessage): Promise<void> {
  if (!RESEND_API_KEY || !NOTIFY_TO) {
    return;
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      // 받은 메일에서 바로 "답장"을 누르면 문의한 사람에게 회신되도록 합니다.
      replyTo: contact.email,
      subject: `[BUILD & LEARN] 새 문의 — ${contact.name}`,
      text: `이름: ${contact.name}\n이메일: ${contact.email}\n\n${contact.message}`,
      html: `
        <p><strong>${escapeHtml(contact.name)}</strong> (${escapeHtml(contact.email)})님이 문의를 남겼습니다.</p>
        <pre style="white-space:pre-wrap;font:inherit;border-left:3px solid #ff4d00;padding-left:12px;margin:16px 0">${escapeHtml(contact.message)}</pre>
        <p style="color:#666">이 메일에 그대로 답장하면 문의한 분에게 회신됩니다.</p>
      `,
    });
  } catch (error) {
    // 알림에 실패해도 문의 자체는 이미 DB에 저장되어 있으므로 로그만 남기고 넘어갑니다.
    console.error("[contact] 새 문의 알림 메일 전송 실패:", error);
  }
}
