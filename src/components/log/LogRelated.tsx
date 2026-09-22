import Link from "next/link";
import { LOG_CATEGORY_OPTIONS } from "@/lib/constants";
import type { Log } from "@/types/log";

const CATEGORY_LABEL = Object.fromEntries(
  LOG_CATEGORY_OPTIONS.map((option) => [option.value, option.label.split(" · ")[0]]),
);

/**
 * 같은 분류 → 부족하면 같은 태그를 가진 글로 채워, 최대 3개의 "더 읽어보기" 후보를 고릅니다.
 * all은 이미 최신순으로 정렬된 공개 Log 전체(getPublishedLogs)이므로 여기서는 추가 조회 없이 필터만 합니다.
 */
function pickRelated(current: Log, all: Log[], limit = 3): Log[] {
  const others = all.filter((log) => log.slug !== current.slug);
  const sameCategory = others.filter((log) => log.category === current.category);
  const picked = sameCategory.slice(0, limit);

  if (picked.length < limit) {
    const pickedSlugs = new Set(picked.map((log) => log.slug));
    const sameTag = others.filter(
      (log) => !pickedSlugs.has(log.slug) && log.tags.some((tag) => current.tags.includes(tag)),
    );
    picked.push(...sameTag.slice(0, limit - picked.length));
  }
  return picked;
}

/**
 * 글 하단의 이전/다음 글 이동과 "더 읽어보기" 추천입니다.
 * all은 최신순 정렬 목록이므로, 배열에서 한 칸 앞이 더 최근 글(다음 글)이고 한 칸 뒤가 더 오래된 글(이전 글)입니다.
 */
export function LogRelated({ current, all }: { current: Log; all: Log[] }) {
  const index = all.findIndex((log) => log.slug === current.slug);
  const newer = index > 0 ? all[index - 1] : undefined;
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : undefined;
  const related = pickRelated(current, all);

  if (!newer && !older && related.length === 0) return null;

  return (
    <nav className="log-related" aria-label="다른 글 보기">
      {(newer || older) && (
        <div className="log-related-adjacent">
          <Link
            className={`log-related-adjacent-link${older ? "" : " is-empty"}`}
            href={older ? `/log/${older.slug}` : "#"}
            aria-disabled={older ? undefined : true}
            tabIndex={older ? undefined : -1}
          >
            <span>← 이전 글</span>
            {older && <strong>{older.title}</strong>}
          </Link>
          <Link
            className={`log-related-adjacent-link log-related-adjacent-link-next${newer ? "" : " is-empty"}`}
            href={newer ? `/log/${newer.slug}` : "#"}
            aria-disabled={newer ? undefined : true}
            tabIndex={newer ? undefined : -1}
          >
            <span>다음 글 →</span>
            {newer && <strong>{newer.title}</strong>}
          </Link>
        </div>
      )}

      {related.length > 0 && (
        <div className="log-related-more">
          <p className="log-related-more-title">더 읽어보기</p>
          <ul>
            {related.map((log) => (
              <li key={log.slug}>
                <Link href={`/log/${log.slug}`}>
                  <span className="log-related-more-category">{CATEGORY_LABEL[log.category]}</span>
                  <strong>{log.title}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
