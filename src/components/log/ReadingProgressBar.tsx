"use client";

import { useEffect, useState } from "react";

/**
 * 헤더 바로 아래에 붙는 얇은 진행 막대입니다. 본문(.mdx-content)의 시작~끝을 기준으로
 * 지금 스크롤 위치가 몇 %인지 계산해 너비로 보여 줍니다. 전체 문서(댓글 포함)가 아니라
 * 본문만 기준으로 삼아, 댓글이 길어져도 진행률이 본문과 무관하게 줄지 않습니다.
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".mdx-content");
    if (!article) return;

    let frame = 0;
    function update() {
      frame = 0;
      const rect = article!.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // 본문 시작이 화면에 들어온 뒤부터 끝이 화면을 빠져나갈 때까지를 0~100%로 매핑합니다.
      const total = rect.height + viewportHeight;
      const passed = viewportHeight - rect.top;
      const ratio = total > 0 ? passed / total : 0;
      setProgress(Math.min(100, Math.max(0, ratio * 100)));
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="reading-progress" role="presentation">
      <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
