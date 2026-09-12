import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * 존재하지 않는 주소에 접근했을 때 보여주는 공통 404 화면입니다.
 * 이 파일은 `(site)` 그룹 밖(최상위)에 있어야 어떤 주소의 404도 처리할 수 있으므로,
 * 그룹 레이아웃의 Header/Footer를 물려받지 못합니다. 그래서 여기서 직접 불러 씁니다.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="container not-found">
          <p className="eyebrow">ERROR / 404</p>
          <h1>페이지를 찾을 수 없습니다.</h1>
          <p>주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.</p>
          <Link className="project-action" href="/">
            Home으로 돌아가기 →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
