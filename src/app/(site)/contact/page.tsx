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
          {/* 정보통신망법 제50조의8에 따라, 공개된 이메일 주소를 자동수집 프로그램으로 무단 수집하는
              행위를 금지한다는 사실을 알립니다. */}
          <p className="legal-notice">
            이 페이지의 이메일 주소는 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여
            무단으로 수집할 수 없으며, 이를 위반 시 정보통신망법에 따라 처벌될 수 있습니다.
          </p>
        </aside>
        <ContactForm />
      </section>
    </div>
  );
}
