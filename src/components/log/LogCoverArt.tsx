import { LOG_CATEGORY_TINTS, coverArtVariant } from "@/lib/log-cover";
import { LOG_CATEGORY_OPTIONS } from "@/lib/constants";
import type { LogCategory } from "@/types/log";

const CATEGORY_LABEL: Record<LogCategory, string> = Object.fromEntries(
  LOG_CATEGORY_OPTIONS.map((option) => [option.value, option.label.split(" · ")[0]]),
) as Record<LogCategory, string>;

// 장식용 "본문 줄" 막대를 분류마다 살짝 다르게 배치해, 같은 틀이라도 세 가지 변형이 나오게 합니다.
// 실제 카드 미리보기(Home Hero의 NOW BUILDING 카드)와 같은 모티프를 재사용해 사이트 전체 디자인 언어를 잇습니다.
const BAR_LAYOUTS: readonly (readonly number[])[] = [
  [86, 62, 74],
  [68, 84, 56],
  [78, 50, 90],
];

/**
 * 대표 이미지를 등록하지 않은 Log가 목록 카드·상세 머리말에서 함께 쓰는 자동 생성 표지입니다.
 * 제목마다 이미지를 직접 만들 필요 없이, 분류 색과 slug로 정해지는 고정된 패턴만으로 그립니다.
 * 색은 CSS 변수를 그대로 참조하므로 다크모드에서도 별도 분기 없이 맞는 색으로 보입니다.
 */
export function LogCoverArt({ category, slug }: { category: LogCategory; slug: string }) {
  const tint = LOG_CATEGORY_TINTS[category];
  const variant = coverArtVariant(slug);
  const bars = BAR_LAYOUTS[variant];
  const gridId = `log-cover-grid-${slug}`;

  return (
    <svg
      aria-hidden="true"
      className="log-cover-art"
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="640" height="360" fill={tint.soft} />
      <pattern id={gridId} width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M32 0H0V32" fill="none" stroke={tint.color} strokeOpacity="0.35" />
      </pattern>
      <rect width="640" height="360" fill={`url(#${gridId})`} />

      {/* 오른쪽 위 모서리를 사선으로 잘라, 대표 이미지 자리처럼 보이도록 카드 느낌의 프레임을 만듭니다. */}
      <path d="M480 0H640V150L480 0Z" fill={tint.color} fillOpacity="0.18" />

      {/* 분류 라벨: 메인/상세의 eyebrow와 같은 표기(예: "AI / LOG")를 그대로 씁니다. */}
      <text x="36" y="60" className="log-cover-art-label" fill={tint.color}>
        {CATEGORY_LABEL[category]} / LOG
      </text>

      {/* Home의 NOW BUILDING 카드 미리보기와 같은 "본문 줄" 막대로, 이 사이트 전체의 카드 모티프를 잇습니다. */}
      <g transform="translate(36 210)">
        <rect width="40" height="40" rx="6" fill={tint.color} />
        {bars.map((width, index) => (
          <rect
            key={index}
            x="56"
            y={index * 20}
            width={width * 3.6}
            height="10"
            rx="5"
            fill={index === 0 ? tint.color : "var(--line)"}
          />
        ))}
      </g>
    </svg>
  );
}
