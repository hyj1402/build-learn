import type { Metadata } from "next";
import Link from "next/link";
import { AdminCommentActions } from "@/components/admin/AdminCommentActions";
import { LogDateRangePicker } from "@/components/admin/LogDateRangePicker";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "프로젝트 댓글 관리" };

const STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  private: "비공개",
  published: "공개",
};
const SORT_OPTIONS = ["newest", "oldest", "author"] as const;
function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}
function dateParam(value: string | string[] | undefined) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

/** Project 댓글을 최신순으로 보여 주고, `?project=slug`가 있으면 해당 프로젝트만 좁혀 봅니다. */
export default async function AdminProjectCommentsPage({
  searchParams,
}: PageProps<"/admin/project-comments">) {
  const values = await searchParams;
  const selectedProject = stringParam(values.project);
  const query = stringParam(values.q).toLocaleLowerCase("ko-KR");
  const selectedVisibility = stringParam(values.visibility);
  const visibility = ["active", "deleted"].includes(selectedVisibility) ? selectedVisibility : "";
  const dateFrom = dateParam(values.from);
  const dateTo = dateParam(values.to);
  const selectedSort = stringParam(values.sort);
  const sort = SORT_OPTIONS.includes(selectedSort as (typeof SORT_OPTIONS)[number])
    ? selectedSort
    : "newest";
  const supabase = await createClient();
  let commentsQuery = supabase
    .from("project_comments")
    .select("id, project_slug, author_name, body, created_at, updated_at, deleted_at")
    .order("created_at", { ascending: false });
  if (selectedProject) commentsQuery = commentsQuery.eq("project_slug", selectedProject);

  const { data: comments, error } = await commentsQuery;
  const slugs = [...new Set((comments ?? []).map((comment) => comment.project_slug))];
  const { data: projects } = slugs.length
    ? await supabase
        .from("projects")
        .select("id, slug, title, publication_status")
        .in("slug", slugs)
    : { data: [] };
  const projectsBySlug = new Map((projects ?? []).map((project) => [project.slug, project]));
  const selectedTitle = selectedProject ? projectsBySlug.get(selectedProject)?.title : null;
  const filteredComments = (comments ?? []).filter((comment) => {
    const project = projectsBySlug.get(comment.project_slug);
    const searchable =
      `${project?.title ?? comment.project_slug}\n${comment.author_name}\n${comment.body}`.toLocaleLowerCase(
        "ko-KR",
      );
    const createdDate = comment.created_at.slice(0, 10);
    return (
      (!query || searchable.includes(query)) &&
      (!visibility ||
        (visibility === "deleted" ? Boolean(comment.deleted_at) : !comment.deleted_at)) &&
      (!dateFrom || createdDate >= dateFrom) &&
      (!dateTo || createdDate <= dateTo)
    );
  });
  const sortedComments = [...filteredComments].sort((left, right) => {
    if (sort === "oldest") return left.created_at.localeCompare(right.created_at);
    if (sort === "author") return left.author_name.localeCompare(right.author_name, "ko-KR");
    return right.created_at.localeCompare(left.created_at);
  });

  return (
    <div className="admin-list-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">COMMUNITY / PROJECT COMMENTS</p>
          <h1>프로젝트 댓글 관리</h1>
          <p>
            {selectedProject
              ? `“${selectedTitle ?? selectedProject}” 프로젝트의 댓글 ${filteredComments.length}건입니다.`
              : `삭제된 댓글을 포함해 모든 프로젝트 댓글 ${filteredComments.length}건입니다.`}
          </p>
        </div>
        {selectedProject && (
          <Link className="admin-primary-action" href="/admin/project-comments">
            전체 댓글 보기
          </Link>
        )}
      </header>

      {error && <p className="admin-error-message">댓글을 불러오지 못했습니다: {error.message}</p>}

      <form action="/admin/project-comments" className="admin-list-filter">
        {selectedProject && <input name="project" type="hidden" value={selectedProject} />}
        <label className="admin-list-filter-query">
          <span>통합 검색</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="프로젝트, 작성자, 댓글 내용 검색"
            type="search"
          />
        </label>
        <label>
          <span>댓글 상태</span>
          <select defaultValue={visibility} name="visibility">
            <option value="">전체</option>
            <option value="active">정상</option>
            <option value="deleted">삭제됨</option>
          </select>
        </label>
        <label className="admin-list-filter-date">
          <span>작성일</span>
          <LogDateRangePicker from={dateFrom} to={dateTo} />
        </label>
        <label>
          <span>정렬</span>
          <select defaultValue={sort} name="sort">
            <option value="newest">작성일 최신순</option>
            <option value="oldest">작성일 오래된순</option>
            <option value="author">작성자 가나다순</option>
          </select>
        </label>
        <div className="admin-list-filter-actions">
          <button className="admin-action-button" type="submit">
            검색
          </button>
          <Link
            className="admin-action-button admin-action-outline"
            href={
              selectedProject
                ? `/admin/project-comments?project=${encodeURIComponent(selectedProject)}`
                : "/admin/project-comments"
            }
          >
            초기화
          </Link>
        </div>
      </form>

      <div className="admin-table-wrap admin-table-wrap-soft">
        <table className="admin-table admin-table-soft admin-comments-table">
          <thead>
            <tr>
              <th>프로젝트</th>
              <th>작성자</th>
              <th>댓글 내용</th>
              <th>상태·기록</th>
              <th>
                <span className="sr-only">작업</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedComments.map((comment) => {
              const project = projectsBySlug.get(comment.project_slug);
              return (
                <tr key={comment.id} className={comment.deleted_at ? "is-deleted" : undefined}>
                  <td>
                    {project ? (
                      <Link
                        className="admin-row-title"
                        href={`/projects/${project.slug}#comment-${comment.id}`}
                      >
                        {project.title}
                      </Link>
                    ) : (
                      <strong className="admin-table-title">{comment.project_slug}</strong>
                    )}
                    {project && (
                      <span className={`admin-status admin-status-${project.publication_status}`}>
                        {STATUS_LABEL[project.publication_status] ?? project.publication_status}
                      </span>
                    )}
                  </td>
                  <td>{comment.author_name}</td>
                  <td className="admin-comment-body">
                    {comment.deleted_at && (
                      <span className="admin-comment-deleted-label">삭제됨 · 관리자 전용</span>
                    )}
                    {comment.body}
                  </td>
                  <td className="admin-date">
                    <time dateTime={comment.created_at}>
                      작성 {new Date(comment.created_at).toLocaleString("ko-KR")}
                    </time>
                    {comment.updated_at && (
                      <time dateTime={comment.updated_at}>
                        수정 {new Date(comment.updated_at).toLocaleString("ko-KR")}
                      </time>
                    )}
                    {comment.deleted_at && (
                      <time dateTime={comment.deleted_at}>
                        삭제 {new Date(comment.deleted_at).toLocaleString("ko-KR")}
                      </time>
                    )}
                  </td>
                  <td className="admin-row-actions-cell">
                    <AdminCommentActions
                      commentId={comment.id}
                      initialBody={comment.body}
                      isDeleted={Boolean(comment.deleted_at)}
                      contentType="project"
                    />
                  </td>
                </tr>
              );
            })}
            {filteredComments.length === 0 && (
              <tr>
                <td className="admin-empty-cell" colSpan={5}>
                  {selectedProject
                    ? "이 프로젝트에는 댓글이 없습니다."
                    : comments?.length
                      ? "조건에 맞는 댓글이 없습니다."
                      : "아직 등록된 댓글이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
