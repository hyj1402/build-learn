import type { SupabaseClient } from "@supabase/supabase-js";

/** 제목을 URL에 안전한 영문 식별자로 바꿉니다. 영문이 없는 제목은 짧은 해시를 붙여 안전하게 만듭니다. */
export function createSlugCandidate(title: string, prefix: "log" | "project"): string {
  const normalized = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  if (normalized) return normalized;

  // 한글만 있는 제목도 매번 같은 후보가 나오도록 제목 문자열로 짧은 해시를 만듭니다.
  const hash = Array.from(title).reduce((value, character) => {
    return (value * 31 + character.charCodeAt(0)) >>> 0;
  }, 0);
  return `${prefix}-${hash.toString(36)}`;
}

/** 이미 사용 중인 식별자는 -2, -3 순으로 비어 있는 번호를 붙여 반환합니다. */
export async function createUniqueSlug(
  supabase: SupabaseClient,
  table: "logs" | "projects",
  requestedSlug: string,
  title: string,
  prefix: "log" | "project",
  currentId?: string,
): Promise<string> {
  const base = createSlugCandidate(requestedSlug || title, prefix);
  let query = supabase.from(table).select("id, slug").like("slug", `${base}%`);
  if (currentId) query = query.neq("id", currentId);

  const { data, error } = await query;
  if (error) throw new Error(`URL 식별자를 확인하지 못했습니다: ${error.message}`);

  const usedSlugs = new Set((data ?? []).map((item) => item.slug));
  if (!usedSlugs.has(base)) return base;

  let number = 2;
  while (usedSlugs.has(`${base}-${number}`)) number += 1;
  return `${base}-${number}`;
}
