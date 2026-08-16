import type { Metadata } from "next";
import { LogCard } from "@/components/log/LogCard";
import { LogFilterBar } from "@/components/log/LogFilterBar";
import { LOG_CATEGORIES } from "@/lib/constants";
import { getLogs } from "@/lib/logs";
import type { LogCategory } from "@/types/log";
export const metadata: Metadata = {
  title: "Log",
  description: "개발과 학습 과정에서 남긴 짧고 긴 기록",
};
export default async function LogPage({ searchParams }: PageProps<"/log">) {
  const values = await searchParams;
  const category =
    typeof values.category === "string" && LOG_CATEGORIES.includes(values.category as LogCategory)
      ? (values.category as LogCategory)
      : undefined;
  const tag = typeof values.tag === "string" ? values.tag : undefined;
  const query = typeof values.q === "string" ? values.q : undefined;
  const allLogs = getLogs();
  const tags = [...new Set(allLogs.flatMap((log) => log.tags))].sort();
  const logs = getLogs({ category, tag, query });
  const firstImageIndex = logs.findIndex((log) => log.thumbnailImage);
  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">LOG / TECH JOURNAL</p>
        <h1>Log</h1>
        <p>개발하며 발견한 문제와 배운 내용을 부담 없이 기록합니다.</p>
      </header>
      <LogFilterBar activeCategory={category} activeTag={tag} query={query} tags={tags} />
      {logs.length > 0 ? (
        <div className="log-list">
          {logs.map((log, index) => (
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
    </div>
  );
}
