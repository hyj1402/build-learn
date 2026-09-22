import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { LogCoverArt } from "@/components/log/LogCoverArt";
import type { Log } from "@/types/log";

/** DB의 ISO 시간값을 목록에서 읽기 쉬운 한국 날짜 형식으로 바꿉니다. */
function formatLogDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** 목록과 Home에서 재사용하는 Log 요약 카드입니다. 썸네일이 없어도 같은 컴포넌트가 동작합니다. */
export function LogCard({
  log,
  priority = false,
  headingLevel = "h3",
}: {
  log: Log;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  // 페이지의 h1 다음 제목 단계가 건너뛰지 않도록 호출 위치에서 h2/h3를 선택합니다.
  const Heading = headingLevel;

  return (
    // 대표 이미지가 없어도 자동 생성 표지를 대신 보여 주므로, 카드 레이아웃은 항상 이미지가 있는 폭을 씁니다.
    <Link className="log-card log-card-with-image" href={`/log/${log.slug}`}>
      <div className="log-card-image">
        {log.thumbnailImage ? (
          <Image
            src={log.thumbnailImage}
            alt={`${log.title} 대표 이미지`}
            fill
            // 실제 이미지가 있는 첫 카드만 빠르게 요청해 LCP 경고를 예방합니다.
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 800px) 100vw, 220px"
          />
        ) : (
          <LogCoverArt category={log.category} slug={log.slug} />
        )}
      </div>
      <time dateTime={log.createdAt}>{formatLogDate(log.createdAt)}</time>
      <div>
        <Heading>{log.title}</Heading>
        <p className="muted">{log.summary}</p>
      </div>
      <Badge>{log.category}</Badge>
    </Link>
  );
}
