import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "../actions";
import { ProjectForm } from "../ProjectForm";
export const metadata: Metadata = { title: "새 프로젝트" };
/** DB 카테고리를 읽어 새 카테고리도 폼에 자동 반영합니다. */
export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .eq("content_type", "project")
    .eq("is_active", true)
    .order("display_order");
  return (
    <div className="admin-editor-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">NEW PROJECT</p>
          <h1>새 프로젝트</h1>
          <p>먼저 임시저장하고 검토가 끝난 뒤 공개하세요.</p>
        </div>
      </header>
      <ProjectForm action={createProject} categories={data ?? []} submitLabel="작성 완료" />
    </div>
  );
}
