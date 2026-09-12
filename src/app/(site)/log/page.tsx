import type { Metadata } from "next";
import Link from "next/link";
import { LogCard } from "@/components/log/LogCard";
import { LogFilterBar } from "@/components/log/LogFilterBar";
import { LOG_CATEGORIES } from "@/lib/constants";
import { getPublishedLogs } from "@/lib/logs-db";
import type { LogCategory } from "@/types/log";
export const metadata: Metadata = {
  title: "Log",
  description: "개발과 학습 과정에서 남긴 짧고 긴 기록",
};

/** 페이지가 많아져도 처음·끝과 현재 페이지 주변만 보이도록 숫자와 생략표를 만듭니다. */
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

/** URL의 category, tag, q 값을 읽어 서버에서 필터링한 Log 목록을 만듭니다. */
export default async function LogPage({ searchParams }: PageProps<"/log">) {
  const values = await searchParams;
  // 직접 입력된 잘못된 카테고리를 데이터 함수에 넘기지 않도록 허용 목록으로 검사합니다.
  const category =
    typeof values.category === "string" && LOG_CATEGORIES.includes(values.category as LogCategory)
      ? (values.category as LogCategory)
      : undefined;
  const tag = typeof values.tag === "string" ? values.tag : undefined;
  const query = typeof values.q === "string" ? values.q : undefined;
  // 태그 메뉴는 현재 검색 결과가 아니라 전체 공개 글의 태그를 기준으로 만들어야 항상 동일합니다.
  const allLogs = await getPublishedLogs();
  const tags = [...new Set(allLogs.flatMap((log) => log.tags))].sort();
  const logs = await getPublishedLogs({ category, tag, query });
  const requestedPage = typeof values.page === "string" ? Number(values.page) : 1;
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginationItems = getPaginationItems(currentPage, totalPages);
  // 썸네일이 없는 글이 앞에 있어도 실제 첫 이미지 한 장만 eager 로딩하기 위한 위치입니다.
  const firstImageIndex = pageLogs.findIndex((log) => log.thumbnailImage);
  const pageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    const search = params.toString();
    return search ? `/log?${search}` : "/log";
  };
  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">LOG / TECH JOURNAL</p>
        <h1>Log</h1>
        <p>개발하며 발견한 문제와 배운 내용을 부담 없이 기록합니다.</p>
      </header>
      <LogFilterBar activeCategory={category} activeTag={tag} query={query} tags={tags} />
      {pageLogs.length > 0 ? (
        <div className="log-list">
          {pageLogs.map((log, index) => (
            <LogCard
              key={log.slug}
              log={log}
              priority={index === firstImageIndex}
              headingLevel="h2"
            />
          ))}
        </div>
      ) : (
        <p className="empty-state" role="status">
          조건에 맞는 로그가 없습니다.
        </p>
      )}
      {totalPages > 1 && (
        <nav className="log-pagination" aria-label="학습 기록 페이지">
          {currentPage > 1 ? (
            <Link href={pageHref(currentPage - 1)}>← 이전</Link>
          ) : (
            <span>← 이전</span>
          )}
          <div className="log-pagination-numbers">
            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <span className="log-pagination-ellipsis" key={`ellipsis-${index}`}>
                  …
                </span>
              ) : item === currentPage ? (
                <span aria-current="page" className="log-pagination-number is-current" key={item}>
                  {item}
                </span>
              ) : (
                <Link className="log-pagination-number" href={pageHref(item)} key={item}>
                  {item}
                </Link>
              ),
            )}
          </div>
          {currentPage < totalPages ? (
            <Link href={pageHref(currentPage + 1)}>다음 →</Link>
          ) : (
            <span>다음 →</span>
          )}
        </nav>
      )}
    </div>
  );
}
