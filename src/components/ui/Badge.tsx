import type { ReactNode } from "react";
export function Badge({
  children,
  variant = "category",
}: {
  children: ReactNode;
  variant?: "category" | "tag";
}) {
  return <span className={`badge ${variant === "tag" ? "badge-tag" : ""}`}>{children}</span>;
}
