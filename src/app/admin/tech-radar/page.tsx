import type { Metadata } from "next";
import Link from "next/link";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { LogDateRangePicker } from "@/components/admin/LogDateRangePicker";
import { createClient } from "@/lib/supabase/server";
import { CollectButton } from "./CollectButton";
import { DigestButton } from "./DigestButton";
import { DismissButton } from "./DismissButton";
import { DraftLink } from "./DraftLink";

export const metadata: Metadata = { title: "Tech Radar" };

const STATUS_LABEL: Record<string, string> = {
  new: "새 글",
  drafted: "초안 작성함",
  dismissed: "관심없음",
};
// 기존 공개상태 배지 색(amber/green/violet)을 의미에 맞게 재사용합니다(새 CSS 없이).
const STATUS_TONE: Record<string, string> = {
  new: "draft",
  drafted: "published",
  dismissed: "private",
};
const SORT_OPTIONS = ["newest", "oldest", "title", "source"] as const;
function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}
function dateParam(value: string | string[] | undefined) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

type ArticleRow = {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  published_at: string | null;
  status: string;
  // Supabase 관계 조회는 설정에 따라 객체 또는 배열로 오므로 둘 다 방어적으로 처리합니다.
  tech_sources: { name: string } | { name: string }[] | null;
};

function sourceName(row: ArticleRow): string {
  const source = Array.isArray(row.tech_sources) ? row.tech_sources[0] : row.tech_sources;
  return source?.name ?? "알 수 없음";
}

/**
 * 국내 기술 블로그 RSS를 모아두는 수집함입니다.
 * 원문을 그대로 옮기지 않고, 링크와 요약만 보여준 뒤 "초안 만들기"로 직접 쓴 글을 남기게 유도합니다.
 */
export default async function TechRadarPage({ searchParams }: PageProps<"/admin/tech-radar">) {
  const values = await searchParams;
  const pageValue = Number(stringParam(values.page));
  const requestedPage = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const query = stringParam(values.q).toLocaleLowerCase("ko-KR");
  const selectedStatus = stringParam(values.status);
  const status = Object.hasOwn(STATUS_LABEL, selectedStatus) ? selectedStatus : "";
  const sourceId = stringParam(values.source);
  const dateFrom = dateParam(values.from);
  const dateTo = dateParam(values.to);
  const selectedSort = stringParam(values.sort);
  const sort = SORT_OPTIONS.includes(selectedSort as (typeof SORT_OPTIONS)[number])
    ? selectedSort
    : "newest";
  const pageSize = 20;

  const supabase = await createClient();
  const [{ data: sources }, { count: newCount }, { data: articles, error }] = await Promise.all([
    supabase.from("tech_sources").select("id, name").order("name"),
    supabase.from("tech_articles").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("tech_articles")
      .select("id, title, url, summary, published_at, status, tech_sources(name)", {
        count: "exact",
      })
      .order("published_at", { ascending: false, nullsFirst: false }),
  ]);
  const sourceByName = new Map((sources ?? []).map((source) => [source.name, source.id]));
  const filteredArticles = (articles ?? []).filter((article) => {
    const source = sourceName(article);
    const searchable = `${article.title}\n${article.summary ?? ""}\n${source}`.toLocaleLowerCase(
      "ko-KR",
    );
    const publishedDate = article.published_at?.slice(0, 10);
    return (
      (!query || searchable.includes(query)) &&
      (!status || article.status === status) &&
      (!sourceId || sourceByName.get(source) === sourceId) &&
      (!dateFrom || (publishedDate && publishedDate >= dateFrom)) &&
      (!dateTo || (publishedDate && publishedDate <= dateTo))
    );
  });
  const sortedArticles = [...filteredArticles].sort((left, right) => {
    if (sort === "oldest") return (left.published_at ?? "").localeCompare(right.published_at ?? "");
    if (sort === "title") return left.title.localeCompare(right.title, "ko-KR");
    if (sort === "source") return sourceName(left).localeCompare(sourceName(right), "ko-KR");
    return (right.published_at ?? "").localeCompare(left.published_at ?? "");
  });
  const totalPages = Math.max(1, Math.ceil(sortedArticles.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const paginatedArticles = sortedArticles.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="admin-list-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">RESEARCH / TECH RADAR</p>
          <h1>Tech Radar</h1>
          <p>
            국내 기술 블로그 새 글 {newCount ?? 0}건을 확인할 수 있습니다. 읽어본 글은 직접 쓴 학습
            기록으로 남기세요.
          </p>
        </div>
      </header>

      <section className="admin-style-section">
        <h2>지금 수집하기</h2>
        <p className="admin-style-description">
          아직 자동 수집(매일 1회)은 붙이기 전이라, 버튼을 눌러 그 시점 기준으로 가져옵니다. 이미
          가져온 글은 다시 추가되지 않습니다.
        </p>
        <div className="admin-button-row">
          <CollectButton label="전체 수집" className="admin-action-button admin-action-publish" />
          {(sources ?? []).map((source) => (
            <CollectButton key={source.id} sourceId={source.id} label={`${source.name} 수집`} />
          ))}
        </div>
      </section>

      <section className="admin-style-section">
        <h2>오늘의 다이제스트</h2>
        <p className="admin-style-description">
          아직 &quot;새 글&quot; 상태인 글 전체를 Claude가 주제별로 묶고 한두 문장씩 요약해서, Log
          임시저장 글로 만들어줍니다. 자동으로 공개되지 않으니 내용을 확인한 뒤 직접 발행하세요.
        </p>
        <DigestButton />
      </section>

      {error && <p className="admin-error-message">목록을 불러오지 못했습니다: {error.message}</p>}

      <form action="/admin/tech-radar" className="admin-list-filter">
        <label className="admin-list-filter-query">
          <span>통합 검색</span>
          <input defaultValue={query} name="q" placeholder="제목, 요약, 출처 검색" type="search" />
        </label>
        <label>
          <span>수집 상태</span>
          <select defaultValue={status} name="status">
            <option value="">전체</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>출처</span>
          <select defaultValue={sourceId} name="source">
            <option value="">전체</option>
            {(sources ?? []).map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-list-filter-date">
          <span>발행일</span>
          <LogDateRangePicker from={dateFrom} to={dateTo} />
        </label>
        <label>
          <span>정렬</span>
          <select defaultValue={sort} name="sort">
            <option value="newest">발행일 최신순</option>
            <option value="oldest">발행일 오래된순</option>
            <option value="title">제목 가나다순</option>
            <option value="source">출처 가나다순</option>
          </select>
        </label>
        <div className="admin-list-filter-actions">
          <button className="admin-action-button" type="submit">
            검색
          </button>
          <Link className="admin-action-button admin-action-outline" href="/admin/tech-radar">
            초기화
          </Link>
        </div>
      </form>
      <p className="admin-list-filter-result" aria-live="polite">
        조건에 맞는 수집 글 <strong>{filteredArticles.length}개</strong>
      </p>

      <div
        className="admin-table-wrap admin-table-wrap-soft"
        style={{ marginTop: "var(--space-5)" }}
      >
        <table className="admin-table admin-table-soft">
          <thead>
            <tr>
              <th>제목</th>
              <th>출처</th>
              <th>발행일</th>
              <th>상태</th>
              <th>
                <span className="sr-only">작업</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedArticles.map((article) => {
              const draftHref = `/admin/logs/new?${new URLSearchParams({
                title: article.title,
                summary: article.summary ?? "",
                sourceUrl: article.url,
              }).toString()}`;
              return (
                <tr key={article.id}>
                  <td data-label="">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-row-title"
                    >
                      {article.title}
                    </a>
                    {article.summary && (
                      <span className="admin-table-description">{article.summary}</span>
                    )}
                  </td>
                  <td data-label="출처">{sourceName(article)}</td>
                  <td className="admin-date" data-label="발행일">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString("ko-KR")
                      : "-"}
                  </td>
                  <td data-label="상태">
                    <span className={`admin-status admin-status-${STATUS_TONE[article.status]}`}>
                      {STATUS_LABEL[article.status] ?? article.status}
                    </span>
                  </td>
                  <td className="admin-row-actions" data-label="">
                    <DraftLink articleId={article.id} href={draftHref} />
                    {article.status !== "dismissed" && <DismissButton articleId={article.id} />}
                  </td>
                </tr>
              );
            })}
            {paginatedArticles.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty-cell">
                  {articles?.length
                    ? "조건에 맞는 수집 글이 없습니다."
                    : "아직 수집한 글이 없습니다. 위 버튼으로 수집해보세요."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/tech-radar"
        currentPage={page}
        label="Tech Radar 목록 페이지"
        searchParams={{ q: query, status, source: sourceId, from: dateFrom, to: dateTo, sort }}
        totalPages={totalPages}
      />
    </div>
  );
}
