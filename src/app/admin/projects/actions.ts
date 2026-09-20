"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/auth/admin";
import { createUniqueSlug } from "@/lib/content-slug";
import { createClient } from "@/lib/supabase/server";
import type { AdminContentFormState } from "../form-state";

const publicationStatuses = ["draft", "private", "published"];
const projectStatuses = ["planned", "in_progress", "completed", "archived"];
const CONTENT_IMAGES_URL =
  "https://ygcksiktoeewtxujqfig.supabase.co/storage/v1/object/public/content-images/";

/** 공개 URL에서 Storage 삭제 API가 받는 버킷 내부 경로만 안전하게 추출합니다. */
function contentImagePath(url: string | null) {
  return url?.startsWith(CONTENT_IMAGES_URL) ? url.slice(CONTENT_IMAGES_URL.length) : null;
}
/** Server Action은 URL로 직접 호출될 수 있으므로 관리자 권한을 매번 확인합니다. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdminUser(user))) throw new Error("관리자만 사용할 수 있는 기능입니다.");
  return { supabase, user };
}
/** 폼 입력을 DB 프로젝트 필드로 정리하고 허용된 상태 값만 통과시킵니다. */
function projectValues(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const publication_status = String(formData.get("publication_status") ?? "draft");
  const project_status = String(formData.get("project_status") ?? "planned");
  if (!title || !summary) throw new Error("제목, 요약은 필수입니다.");
  if (
    !publicationStatuses.includes(publication_status) ||
    !projectStatuses.includes(project_status)
  )
    throw new Error("잘못된 상태 값입니다.");
  return {
    slug,
    title,
    summary,
    body_text: String(formData.get("body_text") ?? ""),
    category_id: String(formData.get("category_id") ?? "") || null,
    publication_status,
    project_status,
    tech_stack: String(formData.get("tech_stack") ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean),
    period_start: String(formData.get("period_start") ?? "") || null,
    period_end: String(formData.get("period_end") ?? "") || null,
    is_featured: formData.get("is_featured") === "on",
    thumbnail_path: String(formData.get("thumbnail_path") ?? "") || null,
  };
}
function revalidate(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}
/**
 * useActionState용 시그니처(prevState, formData)입니다. 검증·DB 실패는 던지지 않고
 * 에러 상태를 돌려줘 ProjectForm이 화면 안에서 바로 보여줄 수 있게 합니다.
 * redirect()는 내부적으로 특수한 예외를 던지는 방식으로 동작하므로, 반드시 try/catch 밖에서 호출합니다.
 */
export async function createProject(
  _prevState: AdminContentFormState,
  formData: FormData,
): Promise<AdminContentFormState> {
  const { supabase, user } = await requireAdmin();

  let project: ReturnType<typeof projectValues>;
  try {
    project = projectValues(formData);
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "입력값을 확인해주세요.",
    };
  }

  const slug = await createUniqueSlug(supabase, "projects", project.slug, project.title, "project");
  const { error } = await supabase.from("projects").insert({
    ...project,
    slug,
    author_id: user.id,
    published_at: project.publication_status === "published" ? new Date().toISOString() : null,
  });
  if (error) {
    console.error(`프로젝트 저장 실패 (slug=${slug}):`, error.message);
    return { status: "error", message: "저장에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }
  revalidate();
  redirect("/admin/projects?notice=project-saved");
}
export async function updateProject(
  id: string,
  _prevState: AdminContentFormState,
  formData: FormData,
): Promise<AdminContentFormState> {
  const { supabase, user } = await requireAdmin();

  let project: ReturnType<typeof projectValues>;
  try {
    project = projectValues(formData);
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "입력값을 확인해주세요.",
    };
  }

  const { data: current } = await supabase
    .from("projects")
    .select("author_id, published_at, thumbnail_path, slug")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { status: "error", message: "수정할 프로젝트를 찾을 수 없습니다." };
  const slug = await createUniqueSlug(
    supabase,
    "projects",
    project.slug || current.slug,
    project.title,
    "project",
    id,
  );
  const { error } = await supabase
    .from("projects")
    .update({
      ...project,
      slug,
      author_id: current.author_id ?? user.id,
      published_at:
        project.publication_status === "published"
          ? (current.published_at ?? new Date().toISOString())
          : current.published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    console.error(`프로젝트 수정 실패 (id=${id}):`, error.message);
    return { status: "error", message: "수정에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }
  // 새 경로가 정상적으로 DB에 저장된 뒤에만 이전 파일을 지워, 교체 중 이미지를 잃지 않게 합니다.
  if (current.thumbnail_path !== project.thumbnail_path) {
    const oldPath = contentImagePath(current.thumbnail_path);
    if (oldPath) await supabase.storage.from("content-images").remove([oldPath]);
  }
  revalidate(project.slug);
  redirect("/admin/projects?notice=project-saved");
}
export async function deleteProject(id: string) {
  const { supabase } = await requireAdmin();
  const { data: project } = await supabase
    .from("projects")
    .select("thumbnail_path")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(`삭제에 실패했습니다: ${error.message}`);
  const imagePath = contentImagePath(project?.thumbnail_path ?? null);
  if (imagePath) await supabase.storage.from("content-images").remove([imagePath]);
  revalidate();
}
