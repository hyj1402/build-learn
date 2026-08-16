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

/** MDX 글에서 메모·주의·완료 내용을 의미색으로 강조하는 읽기 전용 안내 상자입니다. */
export function Callout({ children, title = "Note", tone = "note" }: CalloutProps) {
  return (
    <aside className={`mdx-callout mdx-callout--${tone}`} aria-label={title}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}

/** 작업 범위나 핵심 값처럼 짧은 정보를 입력창 모양으로 보여주는 읽기 전용 상자입니다. */
export function InputBox({ children, label }: InputBoxProps) {
  return (
    <div className="mdx-input-box">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

// compileMDX에 이 객체를 전달하면 MDX 본문에서 <Callout>, <InputBox> 이름을 바로 쓸 수 있습니다.
export const mdxComponents = { Callout, InputBox };
