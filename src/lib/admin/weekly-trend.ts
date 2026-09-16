export type WeekBucket = { label: string; count: number };

/** N주 전 시각을 ISO 문자열로 반환합니다. 추이 쿼리의 조회 시작 시점을 구하는 데 씁니다. */
export function weeksAgoIso(weeks: number): string {
  return new Date(Date.now() - weeks * 7 * 86_400_000).toISOString();
}

/**
 * ISO 날짜 문자열 배열을 받아 "오늘 기준으로 거슬러 올라간 최근 N주"로 묶어 개수를 셉니다.
 * 달력상의 월요일 시작 주가 아니라 오늘부터 7일씩 끊은 구간이라 정확한 주간 통계가 아니라
 * 대시보드에서 추이만 대략 보기 위한 용도입니다.
 */
export function bucketByWeek(dates: (string | null)[], weeks: number): WeekBucket[] {
  const now = Date.now();
  const buckets = Array.from({ length: weeks }, () => 0);

  for (const iso of dates) {
    if (!iso) continue;
    const diffDays = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
    const weekIndex = Math.floor(diffDays / 7);
    if (weekIndex >= 0 && weekIndex < weeks) {
      buckets[weeks - 1 - weekIndex] += 1;
    }
  }

  return buckets.map((count, i) => ({
    label: i === buckets.length - 1 ? "이번 주" : `${buckets.length - 1 - i}주 전`,
    count,
  }));
}
