import Link from "next/link";

/**
 * 모든 공개 페이지 아래쪽의 운영·법적 안내입니다.
 * 기관 사이트처럼 주소를 늘어놓기보다, 개인 사이트에서 실제로 필요한 문의·정책·콘텐츠 이용 기준을 한곳에 둡니다.
 */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <strong>BUILD &amp; LEARN.</strong>
          <p>만들고 배우고, 그 과정을 기록합니다.</p>
        </div>

        <div className="footer-meta">
          <nav className="footer-links" aria-label="Footer 정보">
            <Link href="/contact">Contact</Link>
            <Link href="/terms">이용약관</Link>
            <Link href="/privacy">개인정보처리방침</Link>
          </nav>
          <p className="footer-content-notice">
            운영자가 작성한 콘텐츠의 무단 복제·재배포를 금합니다.
          </p>
          <small>© 2026 BUILD &amp; LEARN. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}
