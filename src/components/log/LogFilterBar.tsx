import Link from "next/link";
import { Suspense } from "react";
import { SearchInput } from "@/components/search/SearchInput";
import { LOG_CATEGORIES } from "@/lib/constants";
import { createSearchHref } from "@/lib/search-params";

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
