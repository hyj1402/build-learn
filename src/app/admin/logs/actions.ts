"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/auth/admin";
import { createUniqueSlug } from "@/lib/content-slug";
import { LOG_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { LogCategory } from "@/types/log";
import type { AdminContentFormState } from "../form-state";

const CONTENT_IMAGES_URL =
  "https://ygcksiktoeewtxujqfig.supabase.co/storage/v1/object/public/content-images/";

/** 공개 URL에서 Storage 삭제 API가 받는 버킷 내부 경로만 안전하게 추출합니다. */
function contentImagePath(url: string | null) {
  return url?.startsWith(CONTENT_IMAGES_URL) ? url.slice(CONTENT_IMAGES_URL.length) : null;
}

// Server Action 하나하나가 실제로는 외부에서 직접 호출될 수 있는 엔드포인트나 마찬가지라,
// layout.tsx의 관리자 확인과 별개로 각 액션 시작 지점에서 다시 한번 관리자인지 확인합니다.
// (proxy나 layout만 믿지 말라는 Next.js 공식 가이드를 그대로 따른 것입니다.)
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

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

const VALID_STATUS = ["draft", "private", "published"];

/**
 * 폼의 slug가 실제 Log 카테고리 행을 가리키는지 서버에서 다시 확인합니다.
 * hidden input 값은 브라우저에서 바꿀 수 있으므로, 화면의 선택지만 믿고 category_id를 저장하지 않습니다.
 */
async function getLogCategoryId(supabase: Awaited<ReturnType<typeof createClient>>, raw: string) {
  const categorySlug = raw.trim() as LogCategory;
  if (!LOG_CATEGORIES.includes(categorySlug)) {
    throw new Error("잘못된 학습 기록 분류입니다.");
  }

  const { data: category, error } = await supabase
    .from("categories")
    .select("id")
    .eq("content_type", "log")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !category) {
    throw new Error(
      "학습 기록 분류를 찾을 수 없습니다. 카테고리 마이그레이션 적용 상태를 확인해주세요.",
    );
  }
  return category.id;
}

export async function createLog(
  _prevState: AdminContentFormState,
  formData: FormData,
): Promise<AdminContentFormState> {
  const { supabase, user } = await requireAdmin();

  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const bodyText = String(formData.get("body_text") ?? "");
  const tags = parseTags(String(formData.get("tags") ?? ""));
  let categoryId: string;
  try {
    categoryId = await getLogCategoryId(supabase, String(formData.get("category_slug") ?? ""));
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "학습 기록 분류를 확인하지 못했습니다.",
    };
  }
  const publicationStatus = String(formData.get("publication_status") ?? "draft");
  const thumbnailPath = String(formData.get("thumbnail_path") ?? "") || null;

  if (!title) {
    return { status: "error", message: "제목은 필수입니다." };
  }
  if (!VALID_STATUS.includes(publicationStatus)) {
    return { status: "error", message: "잘못된 공개 상태입니다." };
  }

  const slug = await createUniqueSlug(supabase, "logs", requestedSlug, title, "log");

  const { error } = await supabase.from("logs").insert({
    slug,
    title,
    summary: summary || null,
    body_text: bodyText,
    tags,
    category_id: categoryId,
    thumbnail_path: thumbnailPath,
    publication_status: publicationStatus,
    // 글의 소유자를 남겨 두면 향후 여러 작성자·역할을 추가해도 작성 이력을 유지할 수 있습니다.
    author_id: user.id,
    published_at: publicationStatus === "published" ? new Date().toISOString() : null,
  });
  if (error) {
    console.error(`Log 저장 실패 (slug=${slug}):`, error.message);
    return { status: "error", message: "저장에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/admin/logs");
  redirect("/admin/logs?notice=log-saved");
}

export async function updateLog(
  id: string,
  _prevState: AdminContentFormState,
  formData: FormData,
): Promise<AdminContentFormState> {
  const { supabase, user } = await requireAdmin();

  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const bodyText = String(formData.get("body_text") ?? "");
  const tags = parseTags(String(formData.get("tags") ?? ""));
  let categoryId: string;
  try {
    categoryId = await getLogCategoryId(supabase, String(formData.get("category_slug") ?? ""));
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "학습 기록 분류를 확인하지 못했습니다.",
    };
  }
  const publicationStatus = String(formData.get("publication_status") ?? "draft");
  const thumbnailPath = String(formData.get("thumbnail_path") ?? "") || null;

  if (!title) {
    return { status: "error", message: "제목은 필수입니다." };
  }
  if (!VALID_STATUS.includes(publicationStatus)) {
    return { status: "error", message: "잘못된 공개 상태입니다." };
  }

  const { data: current } = await supabase
    .from("logs")
    .select("publication_status, published_at, author_id, slug, thumbnail_path")
    .eq("id", id)
    .single();

  // 처음 published로 바뀌는 순간에만 published_at을 기록하고, 이후 수정에서는 그대로 둡니다.
  const publishedAt =
    publicationStatus === "published"
      ? (current?.published_at ?? new Date().toISOString())
      : current?.published_at;
  const slug = await createUniqueSlug(
    supabase,
    "logs",
    requestedSlug || current?.slug || "",
    title,
    "log",
    id,
  );

  const { error } = await supabase
    .from("logs")
    .update({
      slug,
      title,
      summary: summary || null,
      body_text: bodyText,
      tags,
      category_id: categoryId,
      thumbnail_path: thumbnailPath,
      publication_status: publicationStatus,
      // 초기 CRUD 구현 전에 만든 글은 author_id가 비어 있을 수 있어, 첫 수정 때만 소유자를 보완합니다.
      author_id: current?.author_id ?? user.id,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    console.error(`Log 수정 실패 (id=${id}):`, error.message);
    return { status: "error", message: "수정에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  // 새 대표 이미지가 저장된 뒤에만 기존 파일을 지워 교체 도중 이미지가 사라지지 않게 합니다.
  if (current?.thumbnail_path !== thumbnailPath) {
    const oldPath = contentImagePath(current?.thumbnail_path ?? null);
    if (oldPath) await supabase.storage.from("content-images").remove([oldPath]);
  }

  revalidatePath("/admin/logs");
  redirect("/admin/logs?notice=log-saved");
}

export async function deleteLog(id: string) {
  const { supabase } = await requireAdmin();
  const { data: log } = await supabase
    .from("logs")
    .select("thumbnail_path")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("logs").delete().eq("id", id);
  if (error) {
    throw new Error(`삭제에 실패했습니다: ${error.message}`);
  }
  const imagePath = contentImagePath(log?.thumbnail_path ?? null);
  if (imagePath) await supabase.storage.from("content-images").remove([imagePath]);
  revalidatePath("/admin/logs");
}
