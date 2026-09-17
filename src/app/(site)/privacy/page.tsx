import type { Metadata } from "next";

export const metadata: Metadata = { title: "개인정보처리방침" };

// 정적 텍스트만 있는 페이지라 별도 데이터 조회 없이 고정된 내용을 렌더링합니다.
// Contact 폼(이름·이메일·문의내용)과 Google 로그인(이메일·이름)으로 수집하는 개인정보의
// 처리 방침을 안내해, 개인정보보호법상 공개 의무를 지킵니다.
export default function PrivacyPage() {
  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">PRIVACY</p>
        <h1>개인정보처리방침</h1>
        <p>시행일: 2026-09-17</p>
      </header>

      <div className="mdx-content">
        <p>
          BUILD &amp; LEARN(이하 &quot;사이트&quot;)은 아래와 같이 개인정보를 수집·이용하며,
          이용자의 개인정보를 소중히 다룹니다.
        </p>

        <h2>1. 수집하는 개인정보 항목</h2>
        <ul>
          <li>Contact 문의 작성 시: 이름, 이메일 주소, 문의 내용</li>
          <li>Google 계정으로 로그인 시: 이메일 주소, 이름(또는 표시 이름)</li>
        </ul>

        <h2>2. 개인정보의 수집 및 이용 목적</h2>
        <ul>
          <li>Contact 폼으로 접수된 문의 확인 및 답변</li>
          <li>학습 기록(Log) 게시글에 남긴 댓글 작성자 식별 및 댓글 관리</li>
        </ul>

        <h2>3. 개인정보의 보관 및 파기</h2>
        <p>
          문의 내역은 사이트 운영 목적으로 보관하며, 운영자가 삭제하면 즉시 파기되고 복구할 수
          없습니다. 댓글 및 로그인 계정 정보는 회원이 댓글을 삭제하거나 계정 삭제를 요청하면 지체
          없이 파기합니다.
        </p>

        <h2>4. 개인정보의 제3자 제공 및 처리위탁</h2>
        <p>
          이 사이트는 수집한 개인정보를 외부에 판매하거나 제공하지 않습니다. 다만 서비스 운영을 위해
          아래 업체에 처리를 위탁하고 있습니다.
        </p>
        <ul>
          <li>Google — 로그인(OAuth) 인증</li>
          <li>Supabase — 데이터베이스 저장 및 로그인 세션 관리</li>
          <li>Vercel — 웹사이트 호스팅</li>
        </ul>

        <h2>5. 개인정보의 국외 이전</h2>
        <p>
          위 처리위탁업체(Google, Supabase, Vercel)의 서버는 국외에 있어, 개인정보가 국외로
          이전·저장됩니다. 각 업체는 자체 보안 정책에 따라 데이터를 보호합니다.
        </p>

        <h2>6. 쿠키 등 자동 수집 장치</h2>
        <p>
          로그인 상태 유지를 위해 Supabase Auth가 발급하는 세션 쿠키를 사용합니다. 로그인·댓글
          작성처럼 서비스 이용에 반드시 필요한 쿠키이며, 광고나 방문자 추적 목적으로는 쓰지
          않습니다.
        </p>

        <h2>7. 이용자의 권리</h2>
        <p>
          이용자는 언제든 자신의 개인정보 열람, 정정, 삭제를 요청할 수 있습니다. 아래 문의처로
          연락해 주시면 지체 없이 조치합니다.
        </p>

        <h2>8. 문의처</h2>
        <p>
          <a href="mailto:tkznfk1402@gmail.com">tkznfk1402@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
