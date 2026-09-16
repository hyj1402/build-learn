import Link from "next/link";
import type { Metadata } from "next";
import { TrendChart } from "@/components/admin/TrendChart";
import { bucketByWeek, weeksAgoIso } from "@/lib/admin/weekly-trend";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "관리자 대시보드" };

const TREND_WEEKS = 8;

// 관리자 접근 여부는 상위 layout.tsx에서 이미 확인했으므로, 여기서는 현황만 보여줍니다.
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 관리자 계정으로 조회하면 RLS의 "admin full access" 정책 덕분에 draft/private까지 전부 보입니다.
  // 개수만 필요하므로 head:true로 본문 없이 count만 받아옵니다.
  const countOf = (table: string, filter?: { column: string; value: string | boolean }) => {
    const query = supabase.from(table).select("*", { count: "exact", head: true });
    return filter ? query.eq(filter.column, filter.value) : query;
  };

  // 최근 N주 추이 그래프용 원본 날짜입니다. 개인 사이트라 데이터량이 적어
  // DB에서 주 단위로 묶지 않고 날짜만 받아와 bucketByWeek로 직접 묶습니다.
  const trendSince = weeksAgoIso(TREND_WEEKS);
  const datesOf = (table: string, column: string, filter?: { column: string; value: string }) => {
    const query = supabase.from(table).select(column).gte(column, trendSince);
    return filter ? query.eq(filter.column, filter.value) : query;
  };

  const [
    totalLogs,
    publishedLogs,
    totalProjects,
    publishedProjects,
    totalMembers,
    totalComments,
    unreadMessages,
    memberDates,
    commentDates,
    messageDates,
    techArticleDates,
  ] = await Promise.all([
    countOf("logs"),
    countOf("logs", { column: "publication_status", value: "published" }),
    countOf("projects"),
    countOf("projects", { column: "publication_status", value: "published" }),
    countOf("user_roles", { column: "role", value: "member" }),
    countOf("log_comments"),
    countOf("contact_messages", { column: "is_read", value: false }),
    datesOf("user_roles", "created_at", { column: "role", value: "member" }),
    datesOf("log_comments", "created_at"),
    datesOf("contact_messages", "created_at"),
    datesOf("tech_articles", "fetched_at"),
  ]);

  const metrics = [
    { label: "학습 기록", value: totalLogs.count ?? 0, hint: `공개 ${publishedLogs.count ?? 0}` },
    {
      label: "프로젝트",
      value: totalProjects.count ?? 0,
      hint: `공개 ${publishedProjects.count ?? 0}`,
    },
    { label: "회원", value: totalMembers.count ?? 0, hint: "Google 로그인으로 가입" },
    { label: "댓글", value: totalComments.count ?? 0, hint: "학습 기록에 달린 댓글" },
    { label: "읽지 않은 문의", value: unreadMessages.count ?? 0, accent: true },
  ];

  const trends = [
    {
      key: "members",
      title: "신규 회원",
      data: bucketByWeek(
        (memberDates.data as { created_at: string }[] | null)?.map((r) => r.created_at) ?? [],
        TREND_WEEKS,
      ),
    },
    {
      key: "comments",
      title: "새 댓글",
      data: bucketByWeek(
        (commentDates.data as { created_at: string }[] | null)?.map((r) => r.created_at) ?? [],
        TREND_WEEKS,
      ),
    },
    {
      key: "messages",
      title: "문의",
      data: bucketByWeek(
        (messageDates.data as { created_at: string }[] | null)?.map((r) => r.created_at) ?? [],
        TREND_WEEKS,
      ),
    },
    {
      key: "tech",
      title: "Tech Radar 수집",
      data: bucketByWeek(
        (techArticleDates.data as { fetched_at: string }[] | null)?.map((r) => r.fetched_at) ?? [],
        TREND_WEEKS,
      ),
    },
  ];

  const quickLinks = [
    {
      href: "/admin/logs/new",
      title: "새 학습 기록 쓰기",
      desc: "임시저장으로 시작해 나중에 발행",
    },
    { href: "/admin/logs", title: "학습 기록 관리", desc: "공개 상태 변경, 수정, 삭제" },
    { href: "/admin/projects", title: "프로젝트 관리", desc: "기술 스택·기간·대표 노출 설정" },
    { href: "/admin/messages", title: "문의 확인", desc: "Contact 폼으로 받은 메시지" },
  ];

  return (
    <div>
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>대시보드</h1>
          <p>공개 전 글을 포함한 전체 콘텐츠 현황입니다.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/logs/new">
          + 새 학습 기록
        </Link>
      </header>

      <dl className="admin-metrics">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`admin-metric ${metric.accent ? "admin-metric-accent" : ""}`}
          >
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
            {metric.hint && <span className="admin-date">{metric.hint}</span>}
          </div>
        ))}
      </dl>

      <section aria-labelledby="weekly-trends">
        <h2 className="admin-section-title" id="weekly-trends">
          최근 {TREND_WEEKS}주 추이
        </h2>
        <div className="admin-trend-grid">
          {trends.map((trend) => {
            const latest = trend.data[trend.data.length - 1]?.count ?? 0;
            return (
              <div key={trend.key} className="admin-trend-card">
                <div className="admin-trend-card-head">
                  <span>{trend.title}</span>
                  <strong>이번 주 {latest}</strong>
                </div>
                <TrendChart data={trend.data} />
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="quick-actions">
        <h2 className="admin-section-title" id="quick-actions">
          바로 가기
        </h2>
        <div className="admin-quick-grid">
          {quickLinks.map((link) => (
            <Link key={link.href} className="admin-quick-card" href={link.href}>
              <strong>{link.title}</strong>
              <span>{link.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
