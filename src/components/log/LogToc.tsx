"use client";

import { useEffect, useState } from "react";
import type { LogTocItem } from "@/lib/log-toc";

const ACTIVE_OFFSET_PX = 110;

/**
 * 넓은 화면에서만 보이는 소제목 목차입니다. 항목을 누르면 해당 소제목으로 이동하고,
 * 스크롤 중에는 지금 읽고 있는 절을 목록에서 굵게 표시합니다.
 * "지금 어디를 보고 있는지"는 스크롤이 멈출 때마다 모든 소제목의 실제 위치를 다시 재서 정합니다.
 * (IntersectionObserver의 진입/이탈 이벤트만 보면, 목차를 눌러 멀리 점프하거나 빠르게 스크롤할 때
 *  중간 소제목들이 이벤트 없이 건너뛰어져 표시가 예전 위치에 멈춰 있는 문제가 있어 이 방식을 씁니다.)
 */
export function LogToc({ items }: { items: LogTocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0) return;

    let frame = 0;
    function recompute() {
      frame = 0;
      // 화면 위쪽 기준선(ACTIVE_OFFSET_PX)을 이미 지난 소제목 중 가장 아래 것이 지금 읽는 절입니다.
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - ACTIVE_OFFSET_PX <= 0) current = heading.id;
      }
      setActiveId(current);
    }
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(recompute);
    }

    recompute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="log-toc" aria-label="이 글의 목차">
      <p className="log-toc-title">목차</p>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              className={item.id === activeId ? "is-active" : undefined}
              href={`#${item.id}`}
              aria-current={item.id === activeId ? "location" : undefined}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
