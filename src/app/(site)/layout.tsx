import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * 공개 사이트(홈, Projects, Log, About, Contact, 로그인)가 공유하는 레이아웃입니다.
 * `(site)`처럼 괄호로 감싼 폴더는 "라우트 그룹"이라 URL에 포함되지 않습니다.
 * 즉 주소는 그대로 `/log`, `/projects`이면서 이 그룹에 속한 페이지에만 Header/Footer를 붙일 수 있습니다.
 * 관리자 화면은 이 그룹 밖에 있어서 공개 메뉴가 중복으로 표시되지 않습니다.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* 키보드 사용자가 반복 메뉴를 건너뛰고 본문으로 바로 이동하는 접근성 링크입니다. */}
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
