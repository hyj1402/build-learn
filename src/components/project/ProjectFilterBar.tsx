import Link from "next/link";
import { Suspense } from "react";
import { SearchInput } from "@/components/search/SearchInput";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { createSearchHref } from "@/lib/search-params";

/** 프로젝트 카테고리 링크와 검색창을 묶은 필터 UI입니다. 필터 상태는 URL에 저장됩니다. */
export function ProjectFilterBar({
  activeCategory,
  query,
}: {
  activeCategory?: string;
  query?: string;
}) {
  // 링크 하나를 눌러도 나머지 검색 조건을 보존하기 위한 현재 상태입니다.
  const current = { category: activeCategory, q: query };

  return (
    <div className="filter-bar">
      <div className="filter-links">
        <Link
          className={!activeCategory ? "active" : ""}
          href={createSearchHref("/projects", current, { category: undefined })}
        >
          all
        </Link>
        {PROJECT_CATEGORIES.map((category) => (
          <Link
            key={category}
            className={activeCategory === category ? "active" : ""}
            href={createSearchHref("/projects", current, { category })}
          >
            {category}
          </Link>
        ))}
      </div>
      {/* SearchInput이 useSearchParams를 사용하므로 정적 렌더링 경계를 Suspense로 분리합니다. */}
      <Suspense fallback={null}>
        <SearchInput key={query ?? ""} defaultValue={query} label="프로젝트 검색" />
      </Suspense>
    </div>
  );
}
