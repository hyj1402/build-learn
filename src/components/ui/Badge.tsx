import type { ReactNode } from "react";

/** 카테고리와 태그를 같은 형태로 표시하되 variant로 세부 스타일을 구분합니다. */
export function Badge({
  children,
  variant = "category",
}: {
  children: ReactNode;
  variant?: "category" | "tag";
}) {
  return <span className={`badge ${variant === "tag" ? "badge-tag" : ""}`}>{children}</span>;
}
