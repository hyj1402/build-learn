import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import "@/styles/admin.css";

// /admin 아래 모든 페이지가 공유하는 레이아웃입니다.
// proxy.ts는 "로그인했는지"만 확인하고 여기로 들여보내므로, "로그인한 이 사람이 진짜 관리자(소유자)인지"는
// 반드시 여기서 다시 확인합니다 (Next.js 공식 문서가 권장하는 이중 확인 — proxy 하나만 믿지 않기).
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }
  if (!(await isAdminUser(user))) {
    // 로그인은 했지만 소유자가 아닌 사람: /admin 자체를 존재하지 않는 것처럼 다룹니다.
    redirect("/");
  }

  // 사이드바에 읽지 않은 문의 개수를 함께 보여줘, 다른 화면에 있어도 새 문의를 놓치지 않게 합니다.
  const { count: unreadMessages } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);
  const { count: newTechArticles } = await supabase
    .from("tech_articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  const navGroups = [
    { title: "개요", items: [{ href: "/admin", label: "대시보드" }] },
    {
      title: "콘텐츠",
      items: [
        { href: "/admin/logs", label: "학습 기록" },
        { href: "/admin/projects", label: "프로젝트" },
      ],
    },
    {
      title: "소통",
      items: [
        { href: "/admin/comments", label: "Log 댓글" },
        { href: "/admin/project-comments", label: "Project 댓글" },
        { href: "/admin/messages", label: "문의", badge: unreadMessages ?? 0 },
      ],
    },
    {
      title: "리서치",
      items: [{ href: "/admin/tech-radar", label: "Tech Radar", badge: newTechArticles ?? 0 }],
    },
    {
      title: "운영",
      items: [{ href: "/admin/storage", label: "파일 관리" }],
    },
    { title: "참고", items: [{ href: "/admin/style-guide", label: "스타일 가이드" }] },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link className="admin-side-brand" href="/admin">
          BUILD &amp; LEARN <span>ADMIN</span>
        </Link>

        <AdminSidebarNav groups={navGroups} />

        <div className="admin-side-foot">
          <p className="admin-side-user" title={user.email ?? undefined}>
            {user.email}
          </p>
          <ThemeToggle />
          <Link className="admin-side-link" href="/" target="_blank" rel="noreferrer">
            공개 사이트 보기 ↗
          </Link>
          <LogoutButton className="admin-side-link" />
        </div>
      </aside>

      <main className="admin-main" id="main-content">
        {children}
      </main>
    </div>
  );
}
