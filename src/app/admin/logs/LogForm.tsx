import { AutoSlugField } from "@/components/admin/AutoSlugField";
import { ContentImageUpload } from "@/components/admin/ContentImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

// 새 글 작성/수정 화면이 공유하는 입력 폼입니다.
// Server Action(action={...})으로 바로 제출하므로 클라이언트 JS 상태 관리가 필요 없어 Server Component로 둡니다.
export function LogForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues?: {
    slug: string;
    title: string;
    summary: string | null;
    body_text: string;
    tags: string[];
    publication_status: string;
    thumbnail_path?: string | null;
  };
  submitLabel: string;
}) {
  return (
    <form action={action} className="admin-form">
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="title">
            제목 <span aria-hidden="true">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={defaultValues?.title}
            placeholder="기록의 핵심 내용을 제목으로 작성하세요"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="publication_status">공개 상태</label>
          <AdminSelect
            ariaLabel="공개 상태"
            name="publication_status"
            defaultValue={defaultValues?.publication_status ?? "draft"}
            options={[
              { value: "draft", label: "임시저장 · 관리자만" },
              { value: "private", label: "비공개 · 관리자만" },
              { value: "published", label: "공개 · 모두에게" },
            ]}
          />
        </div>
      </div>

      <AutoSlugField defaultValue={defaultValues?.slug} prefix="log" titleInputId="title" />

      <div className="admin-field">
        <label htmlFor="summary">요약</label>
        <input
          id="summary"
          name="summary"
          defaultValue={defaultValues?.summary ?? ""}
          placeholder="목록과 검색 결과에 표시할 짧은 설명"
        />
      </div>

      <div className="admin-field">
        <label htmlFor="tags">태그</label>
        <input
          id="tags"
          name="tags"
          defaultValue={defaultValues?.tags.join(", ")}
          placeholder="Next.js, Supabase, 회고"
        />
        <p>쉼표로 나누어 입력하세요.</p>
      </div>

      <div className="admin-field">
        <label>대표 이미지</label>
        <ContentImageUpload
          defaultValue={defaultValues?.thumbnail_path ?? ""}
          fieldName="thumbnail_path"
          folder="logs"
        />
      </div>

      <RichTextEditor defaultValue={defaultValues?.body_text} folder="logs/inline" />

      <button type="submit" className="admin-primary-action">
        {submitLabel}
      </button>
    </form>
  );
}
import { AdminSelect } from "@/components/admin/AdminSelect";
