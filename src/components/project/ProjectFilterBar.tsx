import Link from "next/link";
import { Suspense } from "react";
import { SearchInput } from "@/components/search/SearchInput";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { createSearchHref } from "@/lib/search-params";

export function ProjectFilterBar({
  activeCategory,
  query,
}: {
  activeCategory?: string;
  query?: string;
}) {
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
      <Suspense fallback={null}>
        <SearchInput key={query ?? ""} defaultValue={query} label="프로젝트 검색" />
      </Suspense>
    </div>
  );
}
