import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

/**
 * MDX를 컴파일하는 동안(렌더 시점이 아니라 컴파일 시점에) h2 태그마다 `section-1`, `section-2`… id를 붙이는
 * rehype 플러그인입니다. React 컴포넌트 안에서 렌더될 때마다 값을 바꾸는 방식은 side effect로 취급돼
 * (react-hooks 규칙 위반) 피하고, 여기서는 순수하게 한 번만 트리를 훑어 id를 정합니다.
 * 이 순번은 목차(extractLogToc)가 같은 소스에서 뽑는 순서와 반드시 같아야 하므로, 그쪽도 이 이름 규칙을 그대로 씁니다.
 */
export function rehypeLogSectionIds() {
  return (tree: Root) => {
    let index = 0;
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2") return;
      index += 1;
      node.properties = { ...node.properties, id: `section-${index}` };
    });
  };
}
