import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
export const metadata: Metadata = { title: "Contact" };

/** 연락 채널 안내와 현재 UI 단계의 ContactForm을 배치하는 정적 페이지입니다. */
export default function ContactPage() {
  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">CONTACT</p>
        <h1>
          Let&apos;s build
          <br />
          something useful.
        </h1>
        <p>프로젝트와 협업에 관한 이야기를 환영합니다.</p>
      </header>
      <section className="contact-layout">
        <aside>
          <p className="eyebrow">CHANNELS</p>
          <a href="mailto:hello@example.com">Email — 연결 예정</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            GitHub — 주소 업데이트 예정
          </a>
          <span>LinkedIn — 주소 업데이트 예정</span>
        </aside>
        <ContactForm />
      </section>
    </div>
  );
}
