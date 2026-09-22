export type LogTocItem = { id: string; text: string };

/**
 * 글 본문(Markdown)에서 "## " 소제목만 순서대로 뽑아 목차 항목을 만듭니다.
 * 코드 블록 안의 "##"이 소제목으로 잘못 잡히지 않도록 먼저 코드 펜스를 지웁니다.
 * id는 `section-1`, `section-2`… 순번이며, 같은 소스에서 MDX가 만드는 실제 제목의 순서와 반드시 같아야 하므로
 * 이 값을 h2 컴포넌트(createLogMdxComponents)가 그대로 재사용합니다.
 */
export function extractLogToc(markdown: string): LogTocItem[] {
  const withoutCodeFences = markdown.replace(/```[\s\S]*?```/g, "");
  const matches = withoutCodeFences.match(/^##\s+.+$/gm) ?? [];
  return matches.map((line, index) => ({
    id: `section-${index + 1}`,
    text: line.replace(/^##\s+/, "").trim(),
  }));
}
