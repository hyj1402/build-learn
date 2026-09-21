import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";

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

/** React 요소 트리에서 글자만 이어 붙여, 인용문이 무엇으로 시작하는지 확인할 때 씁니다. */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/**
 * MDX의 인용문(>)을 그리는 컴포넌트입니다.
 * "원문:"으로 시작하는 인용문은 글 맨 위 출처를 알리는 관례이므로 일반 인용과 구분되는 "출처 카드"로 보여 주고,
 * 그 밖의 인용문은 평소와 같은 blockquote로 둡니다.
 */
export function SourceAwareBlockquote(props: ComponentPropsWithoutRef<"blockquote">) {
  const first = Children.toArray(props.children).find(isValidElement);
  if (first && textOf(first).trimStart().startsWith("원문:")) {
    return (
      <aside className="source-card" aria-label="원문 출처">
        <span className="source-card-label">SOURCE</span>
        <div>{props.children}</div>
      </aside>
    );
  }
  return <blockquote {...props} />;
}

// compileMDX에 이 객체를 전달하면 MDX 본문에서 <Callout>, <InputBox> 이름을 바로 쓸 수 있습니다.
export const mdxComponents = { Callout, InputBox, blockquote: SourceAwareBlockquote };
