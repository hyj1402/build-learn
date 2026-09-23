"use server";

import { incrementLogView } from "@/lib/logs-db";
import { incrementProjectView } from "@/lib/projects-db";
import { createClient } from "@/lib/supabase/server";

const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_REFERRER_HOST_LENGTH = 253;

/** Server Action을 직접 호출하더라도 전체 URL이 저장되지 않게 서버에서 한 번 더 도메인만 남깁니다. */
function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;

  try {
    const url = new URL(referrer.includes("://") ? referrer : `https://${referrer}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.hostname.slice(0, MAX_REFERRER_HOST_LENGTH) || null;
  } catch {
    return null;
  }
}

/**
 * 공개 상세 화면에서만 호출하는 조회수 증가 Server Action입니다.
 * 브라우저가 임의로 호출할 수 있으므로 콘텐츠 종류와 slug 형태를 먼저 제한하고,
 * 실제 공개 상태 검사는 DB 함수가 `published` 행만 갱신하는 조건으로 한 번 더 맡습니다.
 */
export async function trackPublicContentView(kind: "log" | "project", slug: string): Promise<void> {
  if (!PUBLIC_SLUG_PATTERN.test(slug)) return;

  if (kind === "log") {
    await incrementLogView(slug);
    return;
  }

  await incrementProjectView(slug);
}

/**
 * "이 글이 언제 읽혔는지" 관리자 전용 방문 로그(`content_view_events`)에 한 줄을 남깁니다.
 * 입력값이 예상 형식과 다르면 조용히 무시합니다 — 방문 로그가 실패해도 페이지 표시에는 영향이 없어야 합니다.
 * 실제 저장 가능 여부(공개 글인지)는 DB의 insert 정책이 한 번 더 검사합니다.
 *
 * visitorId는 브라우저가 만든 임의 UUID일 뿐 실제 신원과 연결되지 않고, 유입 경로는 도메인만 보관합니다.
 * 입력값이 예상 형식과 다르면 조용히 무시합니다 — 방문 로그가 실패해도 페이지 표시에는 영향이 없어야 합니다.
 * 실제 저장 가능 여부(공개 글인지)는 DB의 insert 정책이 한 번 더 검사합니다.
 * 입력값이 예상 형식과 다르면 조용히 무시합니다 — 방문 로그가 실패해도 페이지 표시에는 영향이 없어야 합니다.
 * 실제 저장 가능 여부(공개 글인지)는 DB의 insert 정책이 한 번 더 검사합니다.
 */
export async function recordContentViewEvent(
  kind: "log" | "project",
  slug: string,
  visitorId: string,
  referrer: string | null,
): Promise<void> {
  if (!PUBLIC_SLUG_PATTERN.test(slug) || !UUID_PATTERN.test(visitorId)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("content_view_events").insert({
    content_type: kind,
    slug,
    visitor_id: visitorId,
    referrer: referrerHost(referrer),
  });
  if (error) console.error(`방문 로그 저장 실패 (${kind}:${slug}):`, error.message);
}
