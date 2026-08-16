import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Log } from "@/types/log";
export function LogCard({
  log,
  priority = false,
  headingLevel = "h3",
}: {
  log: Log;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <Link
      className={`log-card ${log.thumbnailImage ? "log-card-with-image" : ""}`}
      href={`/log/${log.slug}`}
    >
      {log.thumbnailImage && (
        <div className="log-card-image">
          <Image
            src={log.thumbnailImage}
            alt={`${log.title} 대표 이미지`}
            fill
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 800px) 100vw, 220px"
          />
        </div>
      )}
      <time dateTime={log.createdAt}>{log.createdAt}</time>
      <div>
        <Heading>{log.title}</Heading>
        <p className="muted">{log.summary}</p>
      </div>
      <Badge>{log.category}</Badge>
    </Link>
  );
}
