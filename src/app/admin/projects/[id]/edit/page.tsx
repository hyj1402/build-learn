import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "../../ProjectForm";
import { updateProject } from "../../actions";
export const metadata: Metadata = { title: "프로젝트 수정" };
/** 프로젝트와 카테고리를 병렬로 읽어 수정 화면을 구성합니다. */
export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: categories }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, slug, title, summary, body_text, category_id, publication_status, project_status, tech_stack, period_start, period_end, is_featured, thumbnail_path",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, name")
      .eq("content_type", "project")
      .eq("is_active", true)
      .order("display_order"),
  ]);
  if (!project) notFound();
  return (
    <div className="admin-editor-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">EDIT PROJECT</p>
          <h1>프로젝트 수정</h1>
          <p>저장하면 공개 목록에도 바로 반영됩니다.</p>
        </div>
      </header>
      <ProjectForm
        action={updateProject.bind(null, project.id)}
        categories={categories ?? []}
        defaultValues={project}
        submitLabel="수정 완료"
      />
    </div>
  );
}
