import type { WeekBucket } from "@/lib/admin/weekly-trend";

/**
 * 주간 데이터를 세로 막대 그래프로 그리는 작은 SVG 컴포넌트입니다.
 * 데이터가 적은 개인 사이트 특성상 별도 차트 라이브러리를 쓰지 않고 직접 그립니다.
 */
export function TrendChart({ data }: { data: WeekBucket[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 280;
  const height = 72;
  const gap = 4;
  const barWidth = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="admin-trend-chart"
      role="img"
      aria-label={`최근 ${data.length}주 추이: ${data.map((d) => `${d.label} ${d.count}`).join(", ")}`}
    >
      {data.map((point, i) => {
        const barHeight = Math.max(2, (point.count / max) * height);
        const x = i * (barWidth + gap);
        const y = height - barHeight;
        return (
          <rect
            key={point.label}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={2}
            className={i === data.length - 1 ? "admin-trend-bar is-current" : "admin-trend-bar"}
          />
        );
      })}
    </svg>
  );
}
