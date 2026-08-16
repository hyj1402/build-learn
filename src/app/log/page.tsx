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
  const allLogs = getLogs();
  const tags = [...new Set(allLogs.flatMap((log) => log.tags))].sort();
  const logs = getLogs({ category, tag, query });
  // 썸네일이 없는 글이 앞에 있어도 실제 첫 이미지 한 장만 eager 로딩하기 위한 위치입니다.
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
