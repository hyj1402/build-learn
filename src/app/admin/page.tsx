import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "관리자 대시보드" };

// 관리자 접근 여부는 상위 layout.tsx에서 이미 확인했으므로, 여기서는 현황만 보여줍니다.
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 관리자 계정으로 조회하면 RLS의 "admin full access" 정책 덕분에 draft/private까지 전부 보입니다.
  // 개수만 필요하므로 head:true로 본문 없이 count만 받아옵니다.
  const countOf = (table: string, filter?: { column: string; value: string | boolean }) => {
    const query = supabase.from(table).select("*", { count: "exact", head: true });
    return filter ? query.eq(filter.column, filter.value) : query;
  };

  const [totalLogs, publishedLogs, totalProjects, publishedProjects, unreadMessages] =
    await Promise.all([
      countOf("logs"),
      countOf("logs", { column: "publication_status", value: "published" }),
      countOf("projects"),
      countOf("projects", { column: "publication_status", value: "published" }),
      countOf("contact_messages", { column: "is_read", value: false }),
    ]);

  const metrics = [
    { label: "학습 기록", value: totalLogs.count ?? 0, hint: `공개 ${publishedLogs.count ?? 0}` },
    {
      label: "프로젝트",
      value: totalProjects.count ?? 0,
      hint: `공개 ${publishedProjects.count ?? 0}`,
    },
    { label: "읽지 않은 문의", value: unreadMessages.count ?? 0, accent: true },
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
