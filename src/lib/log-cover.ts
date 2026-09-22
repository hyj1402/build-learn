import type { LogCategory } from "@/types/log";

/**
 * 분류마다 다른 색(이미 다크모드까지 대응된 editorial 색상 토큰)을 매겨,
 * 대표 이미지가 없는 글도 목록에서 분류를 색으로 구분할 수 있게 합니다.
 * 값(HEX)이 아니라 CSS 변수 이름을 돌려주므로, 실제 색은 globals.css가 라이트/다크에 맞게 정합니다.
 */
export const LOG_CATEGORY_TINTS: Record<LogCategory, { color: string; soft: string }> = {
  dev: { color: "var(--editorial-blue)", soft: "var(--editorial-blue-soft)" },
  ai: { color: "var(--editorial-violet)", soft: "var(--editorial-violet-soft)" },
  life: { color: "var(--editorial-green)", soft: "var(--editorial-green-soft)" },
  etc: { color: "var(--editorial-amber)", soft: "var(--editorial-amber-soft)" },
};

/**
 * slug 글자로 0~2 사이의 고정된 숫자를 만듭니다. 같은 글은 항상 같은 값이 나와
 * 매 렌더마다(빌드마다) 모양이 바뀌지 않으면서도, 글마다 장식 배치에 약간의 변화를 줍니다.
 */
export function coverArtVariant(slug: string): 0 | 1 | 2 {
  const hash = Array.from(slug).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  return (hash % 3) as 0 | 1 | 2;
}
