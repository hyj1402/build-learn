import type { Metadata } from "next";
import { AdminPagination } from "@/components/admin/AdminPagination";
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
  const pageValue = typeof values.page === "string" ? Number(values.page) : 1;
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  const supabase = await createClient();
  const [{ data: sources }, { count: newCount }, { data: articles, error, count }] =
    await Promise.all([
      supabase.from("tech_sources").select("id, name").order("name"),
      supabase
        .from("tech_articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("tech_articles")
        .select("id, title, url, summary, published_at, status, tech_sources(name)", {
          count: "exact",
        })
        .order("published_at", { ascending: false, nullsFirst: false })
        .range(from, from + pageSize - 1),
    ]);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

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
            {(articles ?? []).map((article) => {
              const draftHref = `/admin/logs/new?${new URLSearchParams({
                title: article.title,
                summary: article.summary ?? "",
                sourceUrl: article.url,
              }).toString()}`;
              return (
                <tr key={article.id}>
                  <td>
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
                  <td>{sourceName(article)}</td>
                  <td className="admin-date">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString("ko-KR")
                      : "-"}
                  </td>
                  <td>
                    <span className={`admin-status admin-status-${STATUS_TONE[article.status]}`}>
                      {STATUS_LABEL[article.status] ?? article.status}
                    </span>
                  </td>
                  <td className="admin-row-actions">
                    <DraftLink articleId={article.id} href={draftHref} />
                    {article.status !== "dismissed" && <DismissButton articleId={article.id} />}
                  </td>
                </tr>
              );
            })}
            {(articles ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty-cell">
                  아직 수집한 글이 없습니다. 위 버튼으로 수집해보세요.
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
        totalPages={totalPages}
      />
    </div>
  );
}
