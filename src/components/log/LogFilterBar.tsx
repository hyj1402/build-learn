import Link from "next/link";
import { Suspense } from "react";
import { SearchInput } from "@/components/search/SearchInput";
import { LOG_CATEGORIES } from "@/lib/constants";
import { createSearchHref } from "@/lib/search-params";

/** Log의 카테고리·태그·검색어를 URL 쿼리스트링으로 함께 관리합니다. */
export function LogFilterBar({
  activeCategory,
  activeTag,
  query,
  tags,
}: {
  activeCategory?: string;
  activeTag?: string;
  query?: string;
  tags: string[];
}) {
  // 새 링크를 만들 때 선택하지 않은 조건이 사라지지 않도록 현재 조건을 모두 모읍니다.
  const current = { category: activeCategory, tag: activeTag, q: query };

  return (
    <div className="filter-stack">
      <div className="filter-bar">
        <div className="filter-links">
          <Link
            className={!activeCategory ? "active" : ""}
            href={createSearchHref("/log", current, { category: undefined })}
          >
            all
          </Link>
          {LOG_CATEGORIES.map((category) => (
            <Link
              key={category}
              className={activeCategory === category ? "active" : ""}
              href={createSearchHref("/log", current, { category })}
            >
              {category}
            </Link>
          ))}
        </div>
        {/* useSearchParams를 쓰는 검색창만 별도의 정적 렌더링 경계에 둡니다. */}
        <Suspense fallback={null}>
          <SearchInput key={query ?? ""} defaultValue={query} label="로그 검색" />
        </Suspense>
      </div>
      <div className="tag-filter" aria-label="태그 필터">
        <Link
          className={!activeTag ? "active" : ""}
          href={createSearchHref("/log", current, { tag: undefined })}
        >
          모든 태그
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag}
            className={activeTag === tag ? "active" : ""}
            href={createSearchHref("/log", current, { tag })}
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
