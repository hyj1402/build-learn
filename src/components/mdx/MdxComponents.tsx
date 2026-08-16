import type { ReactNode } from "react";

type CalloutTone = "note" | "warning" | "success";

type CalloutProps = {
  children: ReactNode;
  title?: string;
  tone?: CalloutTone;
};

type InputBoxProps = {
  children: ReactNode;
  label: string;
};

export function Callout({ children, title = "Note", tone = "note" }: CalloutProps) {
  return (
    <aside className={`mdx-callout mdx-callout--${tone}`} aria-label={title}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}

export function InputBox({ children, label }: InputBoxProps) {
  return (
    <div className="mdx-input-box">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

export const mdxComponents = { Callout, InputBox };
