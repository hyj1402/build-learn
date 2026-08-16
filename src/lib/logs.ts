import { readContentFile, readContentFiles } from "@/lib/mdx";
import type { Log, LogFilter } from "@/types/log";
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
    content: item.content,
  };
}
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
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getLogBySlug(slug: string) {
  const item = readContentFile("logs", slug);
  if (!item) return undefined;
  const log = toLog(item);
  return log.isPublished ? log : undefined;
}
