"use client";

// 저장 실패를 폼 안에서 바로 보여줘야 하므로(useActionState) Client Component로 둡니다.
import { useActionState } from "react";
import { AutoSlugField } from "@/components/admin/AutoSlugField";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { ContentImageUpload } from "@/components/admin/ContentImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { LOG_CATEGORY_OPTIONS } from "@/lib/constants";
import { IDLE_STATE, type AdminContentFormState } from "../form-state";

// 새 글 작성/수정 화면이 공유하는 입력 폼입니다.
export function LogForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: AdminContentFormState, formData: FormData) => Promise<AdminContentFormState>;
  defaultValues?: {
    slug: string;
    title: string;
    summary: string | null;
    body_text: string;
    tags: string[];
    category_slug?: string;
    publication_status: string;
    thumbnail_path?: string | null;
  };
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, IDLE_STATE);
  return (
    <form action={formAction} className="admin-form">
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
          <label htmlFor="category_slug">
            분류 <span aria-hidden="true">*</span>
          </label>
          {/* hidden input을 포함한 AdminSelect가 Server Action에 slug를 제출합니다. */}
          <AdminSelect
            ariaLabel="학습 기록 분류"
            name="category_slug"
            defaultValue={defaultValues?.category_slug ?? "dev"}
            options={
              // 미분류 글(빈 값)은 선택 안내 항목을 함께 보여 주고, 고르기 전에는 서버가 저장을 거절합니다.
              defaultValues?.category_slug === ""
                ? [{ value: "", label: "분류를 선택하세요" }, ...LOG_CATEGORY_OPTIONS]
                : [...LOG_CATEGORY_OPTIONS]
            }
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

      <button type="submit" className="admin-primary-action" disabled={isPending}>
        {isPending ? "저장 중..." : submitLabel}
      </button>
      {state.status === "error" && (
        <p className="login-message login-message-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
