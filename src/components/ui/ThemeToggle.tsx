"use client";

import { useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";

const ORDER: ThemeChoice[] = ["system", "light", "dark"];
const LABEL: Record<ThemeChoice, string> = { system: "자동", light: "라이트", dark: "다크" };
const ICON: Record<ThemeChoice, string> = { system: "🖥️", light: "☀️", dark: "🌙" };

/**
 * 클릭할 때마다 "자동(시스템 설정 따라감) → 라이트 → 다크" 순서로 바뀌는 버튼입니다.
 * 선택값은 localStorage에 저장하고, 실제 색 반영은 <html data-theme="..."> 속성으로 합니다.
 * 첫 화면이 그려지기 전에 저장된 값을 먼저 반영하는 코드는 src/app/layout.tsx의 인라인 스크립트가
 * 담당합니다 — 그게 없으면 페이지가 한 번 라이트로 그려졌다가 다크로 바뀌는 깜빡임이 생깁니다.
 */
export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  // localStorage는 브라우저에만 있어서, 서버 렌더링 결과와 다를 수 있는 값은 마운트 후에만 안전하게
  // 읽을 수 있습니다. 이 버튼의 표시 라벨만 갱신하는 용도라 화면 깜빡임 없이 한 번 더 그려지는 정도이고,
  // 실제 테마 적용은 이미 layout.tsx의 인라인 스크립트가 먼저 끝내둔 상태입니다.
  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽을 수 있어 불가피합니다.
    setChoice(saved === "light" || saved === "dark" ? saved : "system");
  }, []);

  function applyTheme(next: ThemeChoice) {
    setChoice(next);
    if (next === "system") {
      window.localStorage.removeItem("theme");
      document.documentElement.removeAttribute("data-theme");
    } else {
      window.localStorage.setItem("theme", next);
      document.documentElement.setAttribute("data-theme", next);
    }
  }

  function handleClick() {
    const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
    applyTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleClick}
      aria-label={`테마: ${LABEL[choice]} (눌러서 전환)`}
      title={`테마: ${LABEL[choice]}`}
    >
      <span aria-hidden="true">{ICON[choice]}</span>
      <span className="theme-toggle-label">{LABEL[choice]}</span>
    </button>
  );
}
