"use server";

import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/auth/admin";
import { fetchFeedArticles } from "@/lib/tech-radar/feed";
import {
  generateDigest,
  renderDigestMarkdown,
  type DigestSourceArticle,
} from "@/lib/tech-radar/digest";
import { classifyTechArticle, isTechArticleTopic } from "@/lib/tech-radar/topics";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdminUser(user))) {
    throw new Error("관리자만 사용할 수 있는 기능입니다.");
  }
  return { supabase, user };
}

/**
 * 소스 하나의 RSS를 읽어와 tech_articles에 저장합니다.
 * url에 unique 제약이 있어, 이미 수집한 글은 onConflict로 건너뛰고 새 글만 추가됩니다(중복 방지).
 */
export async function collectSource(sourceId: string) {
  const { supabase } = await requireAdmin();

  const { data: source, error: sourceError } = await supabase
    .from("tech_sources")
    .select("id, feed_url")
    .eq("id", sourceId)
    .single();
  if (sourceError || !source) {
    throw new Error("수집할 소스를 찾지 못했습니다.");
  }

  const articles = await fetchFeedArticles(source.feed_url);
  if (articles.length > 0) {
    const { error } = await supabase.from("tech_articles").upsert(
      articles.map((article) => ({
        source_id: source.id,
        title: article.title,
        url: article.url,
        summary: article.summary,
        published_at: article.publishedAt,
        // 수집 시점에 무료 규칙으로 우선 분류합니다. 애매한 글은 review로 남아 관리자가 볼 수 있습니다.
        topic: classifyTechArticle(article),
      })),
      { onConflict: "url", ignoreDuplicates: true },
    );
    if (error) {
      throw new Error(`수집 결과를 저장하지 못했습니다: ${error.message}`);
    }
  }

  revalidatePath("/admin/tech-radar");
}

/** 활성화된 모든 소스를 순서대로 수집합니다. 한 소스가 실패해도 나머지는 계속 진행합니다. */
export async function collectAllSources() {
  const { supabase } = await requireAdmin();
  const { data: sources } = await supabase.from("tech_sources").select("id").eq("is_active", true);

  const errors: string[] = [];
  for (const source of sources ?? []) {
    try {
      await collectSource(source.id);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (errors.length > 0) {
    throw new Error(`일부 소스 수집에 실패했습니다: ${errors.join(" / ")}`);
  }
}

/** 관심 없는 글을 목록에서 치웁니다(삭제는 아니라 언제든 되돌릴 수 있음). */
export async function dismissArticle(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("tech_articles")
    .update({ status: "dismissed" })
    .eq("id", id);
  if (error) throw new Error(`처리하지 못했습니다: ${error.message}`);
  revalidatePath("/admin/tech-radar");
}

/** "학습 기록 초안 만들기"를 눌렀다는 것을 기록해, 이미 참고한 글을 구분할 수 있게 합니다. */
export async function markArticleDrafted(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("tech_articles").update({ status: "drafted" }).eq("id", id);
  if (error) throw new Error(`처리하지 못했습니다: ${error.message}`);
  revalidatePath("/admin/tech-radar");
}

/** 관리자가 자동 분류가 애매했던 글을 직접 바로잡을 수 있도록 한 건의 분류만 변경합니다. */
export async function updateArticleTopic(id: string, topic: string) {
  const { supabase } = await requireAdmin();
  if (!isTechArticleTopic(topic)) throw new Error("허용되지 않은 분류입니다.");
  const { error } = await supabase.from("tech_articles").update({ topic }).eq("id", id);
  if (error) throw new Error(`분류를 바꾸지 못했습니다: ${error.message}`);
  revalidatePath("/admin/tech-radar");
}

/**
 * 아직 "검토 필요"로 남아 있는 글만 현재 규칙으로 다시 분류합니다.
 * 관리자가 셀렉터로 직접 고른 분류는 덮어쓰지 않으며, 삭제·상태 변경 없이 topic 값만 바뀝니다.
 * 요청 수를 줄이기 위해 새 분류별로 묶어서 한 번에 갱신합니다.
 */
export async function classifyStoredArticles() {
  const { supabase } = await requireAdmin();
  const { data: articles, error } = await supabase
    .from("tech_articles")
    .select("id, title, summary")
    .eq("topic", "review");
  if (error) throw new Error(`기존 글을 불러오지 못했습니다: ${error.message}`);

  const idsByTopic = new Map<string, string[]>();
  for (const article of articles ?? []) {
    const topic = classifyTechArticle(article);
    if (topic === "review") continue;
    idsByTopic.set(topic, [...(idsByTopic.get(topic) ?? []), article.id]);
  }

  for (const [topic, ids] of idsByTopic) {
    const { error: updateError } = await supabase
      .from("tech_articles")
      .update({ topic })
      .in("id", ids);
    if (updateError) throw new Error(`기존 글 분류를 바꾸지 못했습니다: ${updateError.message}`);
  }
  revalidatePath("/admin/tech-radar");
}

type ArticleWithSource = {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  tech_sources: { name: string } | { name: string }[] | null;
};

// 소스를 늘리거나 오래 방치해 "new" 글이 예상보다 많이 쌓였을 때도 한 번의 Claude 호출 비용이
// 튀지 않도록 상한을 둡니다. 넘치는 만큼은 이번엔 건너뛰고 new 상태로 남아 다음 번에 이어집니다.
const MAX_DIGEST_ARTICLES = 40;

/** 날짜(YYYY-MM-DD)만 받아 그날 00:00:00 ~ 23:59:59.999를 포함하도록 경계를 만듭니다. */
function dayBounds(date: string): { start: string; end: string } {
  return { start: `${date}T00:00:00.000Z`, end: `${date}T23:59:59.999Z` };
}

/**
 * 선택한 topic과 "new" 상태인 글들을 모아 Claude로 카테고리별 요약을 만들고, Log 임시저장 글로 남깁니다.
 * 날짜를 넘기면 그 발행일 구간의 글만 포함하고, 안 넘기면 아직 처리 안 한 글 전부를 대상으로 합니다.
 * 바로 공개하지 않고 draft로 두어, 반드시 사람이 확인한 뒤 발행하도록 합니다.
 */
export async function generateDailyDigest(options?: {
  start?: string;
  end?: string;
  topics?: string[];
}): Promise<{ logId: string }> {
  const { supabase, user } = await requireAdmin();

  // 브라우저에서 온 값은 직접 신뢰하지 않고, 허용한 분류만 남깁니다.
  const topics = (options?.topics ?? ["ai_development"]).filter(isTechArticleTopic);
  if (topics.length === 0) throw new Error("다이제스트에 포함할 분류를 하나 이상 선택해주세요.");

  let query = supabase
    .from("tech_articles")
    .select("id, title, url, summary, tech_sources(name)")
    .eq("status", "new")
    .in("topic", topics);
  if (options?.start) query = query.gte("published_at", dayBounds(options.start).start);
  if (options?.end) query = query.lte("published_at", dayBounds(options.end).end);
  // 오래 기다린 글부터 먼저 포함해서, 상한에 걸려도 특정 글이 계속 뒤로 밀리지 않게 합니다.
  const { data: rows, error } = await query.order("published_at", { ascending: true });
  if (error) throw new Error(`글을 불러오지 못했습니다: ${error.message}`);
  if (!rows || rows.length === 0) {
    throw new Error(
      "선택한 조건에 맞는 새 글이 없습니다. 먼저 수집을 실행하거나 기간을 넓혀주세요.",
    );
  }

  const targetRows = (rows as ArticleWithSource[]).slice(0, MAX_DIGEST_ARTICLES);
  const skippedCount = rows.length - targetRows.length;

  const articles: DigestSourceArticle[] = targetRows.map((row) => {
    const source = Array.isArray(row.tech_sources) ? row.tech_sources[0] : row.tech_sources;
    return {
      id: row.id,
      title: row.title,
      url: row.url,
      summary: row.summary,
      sourceName: source?.name ?? "알 수 없음",
    };
  });

  const digest = await generateDigest(articles);
  const articlesById = new Map(articles.map((article) => [article.id, article]));
  const bodyText =
    renderDigestMarkdown(digest, articlesById) +
    (skippedCount > 0
      ? `\n\n> 한 번에 처리하는 글 수 제한(${MAX_DIGEST_ARTICLES}개)을 넘어 ${skippedCount}건은 이번에 포함하지 못했습니다. 다음 다이제스트에서 이어서 처리됩니다.`
      : "");

  const today = new Date().toISOString().slice(0, 10);
  const isRange = Boolean(options?.start || options?.end);
  const rangeLabel = isRange ? `${options?.start ?? "처음"} ~ ${options?.end ?? today}` : today;
  const slug = isRange
    ? `tech-digest-${options?.start ?? "start"}-${options?.end ?? today}`
    : `tech-digest-${today}`;
  const title = isRange
    ? `기술 블로그 다이제스트 (${rangeLabel})`
    : `오늘의 기술 블로그 다이제스트 (${today})`;

  // 같은 slug로 다시 만들면 새 글을 또 만들지 않고, 그 초안을 최신 내용으로 덮어씁니다.
  const { data: existing } = await supabase
    .from("logs")
    .select("id, publication_status")
    .eq("slug", slug)
    .maybeSingle();

  let logId: string;
  if (existing) {
    if (existing.publication_status === "published") {
      throw new Error(
        "오늘 다이제스트가 이미 공개 발행되어 있습니다. 다시 만들려면 관리자 화면에서 직접 수정해주세요.",
      );
    }
    const { error: updateError } = await supabase
      .from("logs")
      .update({ title, summary: digest.overview, body_text: bodyText })
      .eq("id", existing.id);
    if (updateError) throw new Error(`초안을 갱신하지 못했습니다: ${updateError.message}`);
    logId = existing.id;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("logs")
      .insert({
        slug,
        title,
        summary: digest.overview,
        body_text: bodyText,
        tags: ["다이제스트", "Tech Radar"],
        publication_status: "draft",
        author_id: user.id,
      })
      .select("id")
      .single();
    if (insertError || !inserted) {
      throw new Error(`초안을 만들지 못했습니다: ${insertError?.message}`);
    }
    logId = inserted.id;
  }

  const { error: statusError } = await supabase
    .from("tech_articles")
    .update({ status: "drafted", digest_log_id: logId })
    .in(
      "id",
      articles.map((article) => article.id),
    );
  if (statusError) throw new Error(`글 상태를 갱신하지 못했습니다: ${statusError.message}`);

  revalidatePath("/admin/tech-radar");
  revalidatePath("/admin/logs");
  return { logId };
}
