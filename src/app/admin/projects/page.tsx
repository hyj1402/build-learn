import Link from "next/link";
import type { Metadata } from "next";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { LogDateRangePicker } from "@/components/admin/LogDateRangePicker";
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
const VALID_PUBLICATION_STATUS = Object.keys(labels);
const VALID_PROJECT_STATUS = Object.keys(projectStatusLabels);
const SORT_OPTIONS = ["newest", "oldest", "title", "comments"] as const;

/** 목록 URL에서 문자열 하나와 YYYY-MM-DD 날짜만 꺼내 검색 조건으로 사용합니다. */
function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}
function dateParam(value: string | string[] | undefined) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}
/** 관리자 전용 프로젝트 목록입니다. 공개 전 데이터도 모두 확인할 수 있습니다. */
export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const values = await searchParams;
  const pageValue = Number(stringParam(values.page));
  const requestedPage = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const query = stringParam(values.q).toLocaleLowerCase("ko-KR");
  const selectedPublicationStatus = stringParam(values.status);
  const status = VALID_PUBLICATION_STATUS.includes(selectedPublicationStatus)
    ? selectedPublicationStatus
    : "";
  const selectedProjectStatus = stringParam(values.progress);
  const progress = VALID_PROJECT_STATUS.includes(selectedProjectStatus)
    ? selectedProjectStatus
    : "";
  const dateFrom = dateParam(values.from);
  const dateTo = dateParam(values.to);
  const selectedSort = stringParam(values.sort);
  const sort = SORT_OPTIONS.includes(selectedSort as (typeof SORT_OPTIONS)[number])
    ? selectedSort
    : "newest";
  const pageSize = 10;
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      "id, slug, title, summary, publication_status, project_status, tech_stack, created_at, project_comments(count)",
      {
        count: "exact",
      },
    )
    .order("created_at", { ascending: false });
  // 제목·설명·기술 스택은 한 검색어로 함께 찾되, 관리자 개인 목록 규모에서는 서버에서 안전하게 비교합니다.
  const filteredProjects = (projects ?? []).filter((project) => {
    const searchable =
      `${project.title}\n${project.summary}\n${project.tech_stack.join(" ")}`.toLocaleLowerCase(
        "ko-KR",
      );
    const createdDate = project.created_at.slice(0, 10);
    return (
      (!query || searchable.includes(query)) &&
      (!status || project.publication_status === status) &&
      (!progress || project.project_status === progress) &&
      (!dateFrom || createdDate >= dateFrom) &&
      (!dateTo || createdDate <= dateTo)
    );
  });
  const sortedProjects = [...filteredProjects].sort((left, right) => {
    if (sort === "oldest") return left.created_at.localeCompare(right.created_at);
    if (sort === "title") return left.title.localeCompare(right.title, "ko-KR");
    if (sort === "comments")
      return (right.project_comments[0]?.count ?? 0) - (left.project_comments[0]?.count ?? 0);
    return right.created_at.localeCompare(left.created_at);
  });
  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const paginatedProjects = sortedProjects.slice((page - 1) * pageSize, page * pageSize);
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

      <form action="/admin/projects" className="admin-list-filter">
        <label className="admin-list-filter-query">
          <span>통합 검색</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="제목, 설명, 기술 스택 검색"
            type="search"
          />
        </label>
        <label>
          <span>공개 상태</span>
          <select defaultValue={status} name="status">
            <option value="">전체</option>
            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>진행 상태</span>
          <select defaultValue={progress} name="progress">
            <option value="">전체</option>
            {Object.entries(projectStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-list-filter-date">
          <span>등록일</span>
          <LogDateRangePicker from={dateFrom} to={dateTo} />
        </label>
        <label>
          <span>정렬</span>
          <select defaultValue={sort} name="sort">
            <option value="newest">등록일 최신순</option>
            <option value="oldest">등록일 오래된순</option>
            <option value="title">제목 가나다순</option>
            <option value="comments">댓글 많은순</option>
          </select>
        </label>
        <div className="admin-list-filter-actions">
          <button className="admin-action-button" type="submit">
            검색
          </button>
          <Link className="admin-action-button admin-action-outline" href="/admin/projects">
            초기화
          </Link>
        </div>
      </form>
      <p className="admin-list-filter-result" aria-live="polite">
        조건에 맞는 프로젝트 <strong>{filteredProjects.length}개</strong>
      </p>
      <div className="admin-table-wrap admin-table-wrap-soft">
        <table className="admin-table admin-table-soft">
          <thead>
            <tr>
              <th>제목</th>
              <th>기술 스택</th>
              <th>공개</th>
              <th>진행</th>
              <th>댓글(삭제 포함)</th>
              <th>등록일</th>
              <th>
                <span className="sr-only">작업</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProjects.map((p) => (
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
                <td>
                  <Link
                    className="admin-inline-link"
                    href={`/admin/project-comments?project=${encodeURIComponent(p.slug)}`}
                  >
                    {p.project_comments[0]?.count ?? 0}개
                  </Link>
                </td>
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
                <td colSpan={7} className="admin-empty-cell">
                  {projects?.length
                    ? "조건에 맞는 프로젝트가 없습니다."
                    : "아직 프로젝트가 없습니다."}
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
        searchParams={{ q: query, status, progress, from: dateFrom, to: dateTo, sort }}
        totalPages={totalPages}
      />
    </div>
  );
}
