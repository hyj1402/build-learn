import { readContentFile, readContentFiles } from "@/lib/mdx";
import type { Log, LogFilter } from "@/types/log";

/** MDX frontmatter와 본문을 화면에서 사용하는 Log 타입으로 변환합니다. */
function toLog(item: ReturnType<typeof readContentFiles>[number]): Log {
  return {
    slug: item.slug,
    title: String(item.data.title),
    summary: item.data.summary,
    thumbnailImage: item.data.thumbnailImage,
    category: item.data.category,
    tags: item.data.tags ?? [],
    isPublished: Boolean(item.data.isPublished),
    createdAt: String(item.data.createdAt),
    updatedAt: item.data.updatedAt,
    order: typeof item.data.order === "number" ? item.data.order : undefined,
    content: item.content,
  };
}

/**
 * 공개 Log만 가져와 카테고리·태그·검색어를 동시에 적용합니다.
 * 날짜가 같으면 order가 큰 작업이 최신이며, 마지막 slug 비교는 결과 순서를 항상 일정하게 만듭니다.
 */
export function getLogs(filter: LogFilter = {}): Log[] {
  const q = filter.query?.toLowerCase();
  return readContentFiles("logs")
    .map(toLog)
    .filter((l) => l.isPublished)
    .filter((l) => !filter.category || l.category === filter.category)
    .filter((l) => !filter.tag || l.tags.includes(filter.tag))
    .filter(
      (l) => !q || `${l.title} ${l.summary ?? ""} ${l.tags.join(" ")}`.toLowerCase().includes(q),
    )
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) ||
        (b.order ?? 0) - (a.order ?? 0) ||
        b.slug.localeCompare(a.slug),
    );
}

/** 주소의 slug로 공개 Log 하나를 찾습니다. 비공개 글은 상세 주소로도 노출하지 않습니다. */
export function getLogBySlug(slug: string) {
  const item = readContentFile("logs", slug);
  if (!item) return undefined;
  const log = toLog(item);
  return log.isPublished ? log : undefined;
}
