import type { Metadata } from "next";
import Link from "next/link";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { LogDateRangePicker } from "@/components/admin/LogDateRangePicker";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "방문 로그" };

const TYPE_LABEL: Record<string, string> = { log: "학습 기록", project: "프로젝트" };
const DETAIL_PATH: Record<string, string> = { log: "/log", project: "/projects" };
const STATS_WINDOW_DAYS = 30;
const KOREA_TIME_ZONE = "Asia/Seoul";
const KOREA_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: KOREA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const KOREA_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KOREA_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

type EventRow = {
  id: string;
  content_type: "log" | "project";
  slug: string;
  visitor_id: string;
  referrer: string | null;
  created_at: string;
};

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}
function dateParam(value: string | string[] | undefined) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}
/** 참조 URL에서 도메인만 뽑아 목록을 짧게 보여줍니다. 값이 없거나 이상하면 "직접 방문"으로 취급합니다. */
function referrerHost(referrer: string | null) {
  if (!referrer) return "직접 방문 · 북마크";
  try {
    // 새 기록은 이미 hostname이지만, 기존 URL 전체 기록도 화면에서는 경로를 노출하지 않습니다.
    return new URL(referrer.includes("://") ? referrer : `https://${referrer}`).hostname;
  } catch {
    return "알 수 없음";
  }
}

/** Vercel 서버의 UTC 시간과 무관하게 관리자 기준인 한국 날짜를 YYYY-MM-DD로 만듭니다. */
function koreaDateKey(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = KOREA_DATE_FORMATTER.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
/** N일 전 시각을 ISO 문자열로 반환합니다. 통계 조회 시작 시점을 구하거나 "최근 N일"을 판정하는 데 씁니다. */
function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
function isWithinDays(iso: string, days: number) {
  return iso >= daysAgoIso(days);
}
// Vercel 서버가 UTC에서 실행되어도, 관리자 화면의 "오늘"은 한국 자정 기준으로 판정합니다.
function isToday(iso: string) {
  return koreaDateKey(iso) === koreaDateKey(new Date());
}

/**
 * Log·Project 상세를 언제, 어떤 경로로 방문했는지 보여주는 관리자 전용 화면입니다.
 * content_view_events는 로그인 여부와 무관하게 익명 방문자 UUID만 남기므로, 여기서도
 * "누구"가 아니라 "어떤 글이 언제 얼마나 읽혔는지"만 확인할 수 있습니다.
 */
export default async function VisitsPage({ searchParams }: PageProps<"/admin/visits">) {
  const values = await searchParams;
  const pageValue = Number(stringParam(values.page));
  const requestedPage = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const query = stringParam(values.q).toLocaleLowerCase("ko-KR");
  const selectedType = stringParam(values.type);
  const type = selectedType === "log" || selectedType === "project" ? selectedType : "";
  const dateFrom = dateParam(values.from);
  const dateTo = dateParam(values.to);
  const pageSize = 30;

  const supabase = await createClient();
  const statsSince = daysAgoIso(STATS_WINDOW_DAYS);

  // 요약 카드(오늘/7일/30일)는 목록의 검색·기간 조건과 무관하게 항상 최근 30일 기준으로 고정합니다.
  // 목록은 그 아래에서 q·type·from·to 조건을 따로 적용합니다.
  const [{ data: statsRows }, { data: eventRows, error }, { data: logs }, { data: projects }] =
    await Promise.all([
      supabase
        .from("content_view_events")
        .select("content_type, slug, visitor_id, created_at")
        .gte("created_at", statsSince),
      supabase
        .from("content_view_events")
        .select("id, content_type, slug, visitor_id, referrer, created_at")
        .order("created_at", { ascending: false })
        .limit(5000),
      supabase.from("logs").select("slug, title"),
      supabase.from("projects").select("slug, title"),
    ]);

  const titleByKey = new Map<string, string>();
  for (const log of logs ?? []) titleByKey.set(`log:${log.slug}`, log.title);
  for (const project of projects ?? []) titleByKey.set(`project:${project.slug}`, project.title);
  const titleOf = (row: { content_type: string; slug: string }) =>
    titleByKey.get(`${row.content_type}:${row.slug}`) ?? row.slug;

  const stats = statsRows ?? [];
  const uniqueVisitors = (rows: typeof stats) => new Set(rows.map((row) => row.visitor_id)).size;
  const todayRows = stats.filter((row) => isToday(row.created_at));
  const last7Rows = stats.filter((row) => isWithinDays(row.created_at, 7));
  const metrics = [
    { label: "오늘 방문", value: todayRows.length, hint: `고유 방문 ${uniqueVisitors(todayRows)}` },
    { label: "최근 7일", value: last7Rows.length, hint: `고유 방문 ${uniqueVisitors(last7Rows)}` },
    {
      label: `최근 ${STATS_WINDOW_DAYS}일`,
      value: stats.length,
      hint: `고유 방문 ${uniqueVisitors(stats)}`,
    },
  ];

  const topContent = (() => {
    const counts = new Map<string, { content_type: string; slug: string; count: number }>();
    for (const row of stats) {
      const key = `${row.content_type}:${row.slug}`;
      const current = counts.get(key);
      if (current) current.count += 1;
      else counts.set(key, { content_type: row.content_type, slug: row.slug, count: 1 });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  })();

  const filteredEvents = (eventRows ?? []).filter((row) => {
    const title = titleOf(row).toLocaleLowerCase("ko-KR");
    const visitedDate = koreaDateKey(row.created_at);
    return (
      (!query || title.includes(query) || row.slug.includes(query)) &&
      (!type || row.content_type === type) &&
      (!dateFrom || visitedDate >= dateFrom) &&
      (!dateTo || visitedDate <= dateTo)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pagedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="admin-list-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">OPERATIONS / VISITS</p>
          <h1>방문 로그</h1>
          <p>
            공개 Log·Project 상세를 언제, 어디서 왔는지만 익명으로 기록합니다. 이름·이메일·IP는
            저장하지 않습니다.
          </p>
        </div>
      </header>

      <dl className="admin-metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="admin-metric">
            <dt>{metric.label}</dt>
            <dd>{metric.value.toLocaleString("ko-KR")}</dd>
            <span className="admin-date">{metric.hint}</span>
          </div>
        ))}
      </dl>

      {topContent.length > 0 && (
        <section className="admin-style-section">
          <h2>최근 {STATS_WINDOW_DAYS}일 많이 읽힌 글</h2>
          <ol className="admin-top-content-list">
            {topContent.map((item) => (
              <li key={`${item.content_type}:${item.slug}`}>
                <Link href={`${DETAIL_PATH[item.content_type]}/${item.slug}`} target="_blank">
                  <span className="admin-category-label">{TYPE_LABEL[item.content_type]}</span>
                  {titleOf(item)}
                </Link>
                <strong>{item.count.toLocaleString("ko-KR")}회</strong>
              </li>
            ))}
          </ol>
        </section>
      )}

      {error && <p className="admin-error-message">목록을 불러오지 못했습니다: {error.message}</p>}

      <form action="/admin/visits" className="admin-list-filter">
        <label className="admin-list-filter-query">
          <span>통합 검색</span>
          <input defaultValue={query} name="q" placeholder="글 제목, slug 검색" type="search" />
        </label>
        <label>
          <span>종류</span>
          <select defaultValue={type} name="type">
            <option value="">전체</option>
            <option value="log">학습 기록</option>
            <option value="project">프로젝트</option>
          </select>
        </label>
        <label className="admin-list-filter-date">
          <span>방문일</span>
          <LogDateRangePicker from={dateFrom} to={dateTo} />
        </label>
        <div className="admin-list-filter-actions">
          <button className="admin-action-button" type="submit">
            검색
          </button>
          <Link className="admin-action-button admin-action-outline" href="/admin/visits">
            초기화
          </Link>
        </div>
      </form>

      <p className="admin-list-filter-result" aria-live="polite">
        조건에 맞는 방문 <strong>{filteredEvents.length.toLocaleString("ko-KR")}건</strong>
      </p>

      <div className="admin-table-wrap admin-table-wrap-soft">
        <table className="admin-table admin-table-soft">
          <thead>
            <tr>
              <th>글</th>
              <th>종류</th>
              <th>유입 경로</th>
              <th>방문 시각</th>
            </tr>
          </thead>
          <tbody>
            {pagedEvents.map((row: EventRow) => (
              <tr key={row.id}>
                <td data-label="글">
                  <Link
                    className="admin-table-title"
                    href={`${DETAIL_PATH[row.content_type]}/${row.slug}`}
                    target="_blank"
                  >
                    {titleOf(row)}
                  </Link>
                  <span className="admin-table-description">{row.slug}</span>
                </td>
                <td data-label="종류">
                  <span className="admin-category-label">{TYPE_LABEL[row.content_type]}</span>
                </td>
                <td data-label="유입 경로">{referrerHost(row.referrer)}</td>
                <td className="admin-date" data-label="방문 시각">
                  {KOREA_DATE_TIME_FORMATTER.format(new Date(row.created_at))}
                </td>
              </tr>
            ))}
            {pagedEvents.length === 0 && (
              <tr>
                <td className="admin-empty-cell" colSpan={4}>
                  {(eventRows ?? []).length
                    ? "조건에 맞는 방문 기록이 없습니다."
                    : "아직 기록된 방문이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        basePath="/admin/visits"
        currentPage={page}
        label="방문 로그 페이지"
        searchParams={{ q: query, type, from: dateFrom, to: dateTo }}
        totalPages={totalPages}
      />
    </div>
  );
}
