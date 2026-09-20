import Link from "next/link";

/** 관리자 목록에서 현재 페이지 주변과 처음·끝 페이지만 보여 주기 위한 항목을 만듭니다. */
function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages]);
  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page > 0 && page <= totalPages) pages.add(page);
  }

  const items: Array<number | "ellipsis"> = [];
  let previous = 0;
  for (const page of [...pages].sort((a, b) => a - b)) {
    if (page - previous > 1) items.push("ellipsis");
    items.push(page);
    previous = page;
  }
  return items;
}

/**
 * 프로젝트·학습 기록 관리 화면이 함께 쓰는 페이지 이동 UI입니다.
 * 목록 주소와 현재/전체 페이지를 받으면 안전한 링크를 만들어, 페이지마다 같은 모양과 동작을 유지합니다.
 */
export function AdminPagination({
  basePath,
  currentPage,
  totalPages,
  label,
  searchParams,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  label: string;
  // 목록 필터를 유지한 채 다음 페이지로 이동하기 위한 현재 URL 조건입니다.
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (page: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams ?? {}).filter(([, value]) => value) as [string, string][],
    );
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };
  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav className="admin-pagination" aria-label={label}>
      {currentPage > 1 ? <Link href={href(1)}>처음</Link> : <span>처음</span>}
      {currentPage > 1 ? <Link href={href(currentPage - 1)}>이전</Link> : <span>이전</span>}
      <div className="admin-pagination-numbers">
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span className="admin-pagination-ellipsis" key={`ellipsis-${index}`}>
              …
            </span>
          ) : item === currentPage ? (
            <span aria-current="page" className="admin-pagination-number is-current" key={item}>
              {item}
            </span>
          ) : (
            <Link className="admin-pagination-number" href={href(item)} key={item}>
              {item}
            </Link>
          ),
        )}
      </div>
      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)}>다음</Link>
      ) : (
        <span>다음</span>
      )}
      {currentPage < totalPages ? <Link href={href(totalPages)}>마지막</Link> : <span>마지막</span>}
    </nav>
  );
}
