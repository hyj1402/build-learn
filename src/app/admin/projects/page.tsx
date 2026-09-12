import Link from "next/link";
import type { Metadata } from "next";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { createClient } from "@/lib/supabase/server";
import { deleteProject } from "./actions";
export const metadata: Metadata = { title: "프로젝트 관리" };
const labels: Record<string, string> = { draft: "임시저장", private: "비공개", published: "공개" };
const projectStatusLabels: Record<string, string> = {
  planned: "예정",
  in_progress: "진행 중",
  completed: "완료",
  archived: "보관",
};
/** 관리자 전용 프로젝트 목록입니다. 공개 전 데이터도 모두 확인할 수 있습니다. */
export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const values = await searchParams;
  const pageValue = typeof values.page === "string" ? Number(values.page) : 1;
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const supabase = await createClient();
  const {
    data: projects,
    error,
    count,
  } = await supabase
    .from("projects")
    .select("id, title, summary, publication_status, project_status, tech_stack, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  return (
    <div className="admin-list-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">CONTENT / PROJECTS</p>
          <h1>프로젝트</h1>
          <p>포트폴리오 프로젝트의 초안·비공개·공개 상태를 관리합니다.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/projects/new">
          + 새 프로젝트
        </Link>
      </header>
      {error && <p className="admin-error-message">목록을 불러오지 못했습니다: {error.message}</p>}
      <div className="admin-table-wrap admin-table-wrap-soft">
        <table className="admin-table admin-table-soft">
          <thead>
            <tr>
              <th>제목</th>
              <th>기술 스택</th>
              <th>공개</th>
              <th>진행</th>
              <th>등록일</th>
              <th>
                <span className="sr-only">작업</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(projects ?? []).map((p) => (
              <tr key={p.id}>
                <td>
                  <Link className="admin-row-title" href={`/admin/projects/${p.id}/edit`}>
                    {p.title}
                  </Link>
                  <span className="admin-table-description">{p.summary}</span>
                </td>
                <td>
                  <div className="admin-list-chips" aria-label={`${p.title} 기술 스택`}>
                    {p.tech_stack.slice(0, 3).map((tech: string) => (
                      <span key={tech}>{tech}</span>
                    ))}
                    {p.tech_stack.length > 3 && <span>+{p.tech_stack.length - 3}</span>}
                  </div>
                </td>
                <td>
                  <span className={`admin-status admin-status-${p.publication_status}`}>
                    {labels[p.publication_status] ?? p.publication_status}
                  </span>
                </td>
                <td>{projectStatusLabels[p.project_status] ?? p.project_status}</td>
                <td className="admin-date">{new Date(p.created_at).toLocaleDateString("ko-KR")}</td>
                <td className="admin-row-actions-cell">
                  <div className="admin-row-actions">
                    <AdminConfirmButton
                      confirmTitle="이 프로젝트를 삭제할까요?"
                      confirmDescription={`"${p.title}" 프로젝트가 완전히 삭제되며, 되돌릴 수 없습니다.`}
                      onConfirm={deleteProject.bind(null, p.id)}
                      triggerClassName="admin-action-button admin-action-outline-danger admin-row-action-button"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {!(projects ?? []).length && (
              <tr>
                <td colSpan={6} className="admin-empty-cell">
                  아직 프로젝트가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/projects"
        currentPage={page}
        label="프로젝트 목록 페이지"
        totalPages={totalPages}
      />
    </div>
  );
}
