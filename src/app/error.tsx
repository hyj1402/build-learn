"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * (site) 그룹을 포함해, 더 안쪽에 자체 error.tsx가 없는 모든 경로의 공용 에러 화면입니다.
 * Next.js는 이 파일이 없으면 사이트 디자인과 무관한 기본 에러 화면을 보여주므로,
 * not-found.tsx와 같은 톤으로 만들어 방문자가 당황하지 않게 합니다.
 * error.tsx는 반드시 Client Component여야 합니다(reset()으로 다시 렌더를 시도해야 하므로).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 실제 원인은 서버·브라우저 콘솔에만 남기고, 화면에는 방문자가 이해할 수 있는 안내만 보여줍니다.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main id="main-content">
        <section className="container not-found">
          <p className="eyebrow">ERROR / 500</p>
          <h1>문제가 발생했습니다.</h1>
          <p>페이지를 불러오는 중 오류가 생겼습니다. 다시 시도하거나 잠시 후 다시 방문해주세요.</p>
          <div className="tag-row">
            <button type="button" className="project-action" onClick={() => reset()}>
              다시 시도 →
            </button>
            <Link className="project-action" href="/">
              Home으로 돌아가기 →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
