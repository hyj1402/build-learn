import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
export const metadata: Metadata = { title: "Contact" };

/** 공개 이메일·저장소 링크와, 문의를 DB에 저장하는 ContactForm을 배치하는 페이지입니다. */
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
          <a href="mailto:tkznfk1402@gmail.com">Email — tkznfk1402@gmail.com</a>
          <a href="https://github.com/hyj1402/build-learn" target="_blank" rel="noreferrer">
            GitHub — hyj1402/build-learn
          </a>
        </aside>
        <ContactForm />
      </section>
    </div>
  );
}
