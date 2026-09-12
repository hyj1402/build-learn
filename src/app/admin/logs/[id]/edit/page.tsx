import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogForm } from "../../LogForm";
import { updateLog } from "../../actions";

export const metadata: Metadata = { title: "학습 기록 수정" };

export default async function EditLogPage({ params }: PageProps<"/admin/logs/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: log } = await supabase
    .from("logs")
    .select("id, slug, title, summary, body_text, tags, publication_status, thumbnail_path")
    .eq("id", id)
    .maybeSingle();

  if (!log) {
    notFound();
  }

  return (
    <div className="admin-editor-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">EDIT LOG</p>
          <h1>학습 기록 수정</h1>
          <p>수정 내용은 저장 후 관리자 목록에 바로 반영됩니다.</p>
        </div>
      </header>
      <LogForm action={updateLog.bind(null, log.id)} defaultValues={log} submitLabel="수정 완료" />
    </div>
  );
}
