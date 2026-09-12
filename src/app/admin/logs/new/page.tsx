import type { Metadata } from "next";
import { LogForm } from "../LogForm";
import { createLog } from "../actions";

export const metadata: Metadata = { title: "새 학습 기록" };

// Tech Radar의 "초안 만들기"에서 title/summary/sourceUrl을 쿼리로 넘겨 이 폼을 미리 채웁니다.
// 원문을 그대로 복사하지 않고, 링크만 인용 형태로 본문 맨 위에 넣어 직접 이어 쓰도록 유도합니다.
export default async function NewLogPage({ searchParams }: PageProps<"/admin/logs/new">) {
  const params = await searchParams;
  const title = typeof params.title === "string" ? params.title : undefined;
  const summary = typeof params.summary === "string" ? params.summary : undefined;
  const sourceUrl = typeof params.sourceUrl === "string" ? params.sourceUrl : undefined;

  const defaultValues = title
    ? {
        slug: "",
        title,
        summary: summary || null,
        body_text: sourceUrl ? `> 원문: [${title}](${sourceUrl})\n\n` : "",
        tags: [],
        publication_status: "draft",
      }
    : undefined;

  return (
    <div className="admin-editor-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow">NEW LOG</p>
          <h1>새 학습 기록</h1>
          <p>먼저 임시저장한 뒤, 검토가 끝났을 때 공개로 발행하세요.</p>
        </div>
      </header>
      <LogForm action={createLog} submitLabel="작성 완료" defaultValues={defaultValues} />
    </div>
  );
}
