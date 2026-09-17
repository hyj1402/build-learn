import Link from "next/link";

/** 모든 페이지 아래쪽에 공통으로 표시되는 사이트 설명, 연도, 개인정보처리방침 링크입니다. */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <strong>BUILD & LEARN.</strong>
        <span>만들고 배우고, 그 과정을 기록합니다.</span>
        <Link href="/privacy">개인정보처리방침</Link>
        <span>© 2026</span>
      </div>
    </footer>
  );
}
