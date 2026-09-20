"use client";

// 저장 실패를 폼 안에서 바로 보여줘야 하므로(useActionState) Client Component로 둡니다.
import { useActionState } from "react";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AutoSlugField } from "@/components/admin/AutoSlugField";
import { ProjectImageUpload } from "@/components/project/ProjectImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { IDLE_STATE, type AdminContentFormState } from "../form-state";

type Values = {
  slug: string;
  title: string;
  summary: string;
  body_text: string;
  category_id: string | null;
  publication_status: string;
  project_status: string;
  tech_stack: string[];
  period_start: string | null;
  period_end: string | null;
  is_featured: boolean;
  thumbnail_path?: string | null;
};
/** 프로젝트 작성과 수정에서 재사용하는 Server Component 폼입니다. */
export function ProjectForm({
  action,
  categories,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: AdminContentFormState, formData: FormData) => Promise<AdminContentFormState>;
  categories: { id: string; name: string }[];
  defaultValues?: Values;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, IDLE_STATE);
  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-row">
        <Field label="제목 *">
          <input id="title" name="title" required defaultValue={defaultValues?.title} />
        </Field>
        <Field label="공개 상태">
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
        </Field>
      </div>
      <div className="admin-form-row">
        <AutoSlugField defaultValue={defaultValues?.slug} prefix="project" titleInputId="title" />
        <Field label="진행 상태">
          <AdminSelect
            ariaLabel="진행 상태"
            name="project_status"
            defaultValue={defaultValues?.project_status ?? "planned"}
            options={[
              { value: "planned", label: "예정" },
              { value: "in_progress", label: "진행 중" },
              { value: "completed", label: "완료" },
              { value: "archived", label: "보관" },
            ]}
          />
        </Field>
      </div>
      <Field label="요약 *">
        <input name="summary" required defaultValue={defaultValues?.summary} />
      </Field>
      <div className="admin-form-row">
        <Field label="카테고리">
          <AdminSelect
            ariaLabel="카테고리"
            name="category_id"
            defaultValue={defaultValues?.category_id ?? ""}
            options={[
              { value: "", label: "선택하지 않음" },
              ...categories.map((category) => ({ value: category.id, label: category.name })),
            ]}
          />
        </Field>
        <Field label="기술 스택">
          <input
            name="tech_stack"
            defaultValue={defaultValues?.tech_stack.join(", ")}
            placeholder="Java, PostgreSQL"
          />
        </Field>
      </div>
      <div className="admin-form-row">
        <Field label="시작 시점">
          <input
            name="period_start"
            defaultValue={defaultValues?.period_start ?? ""}
            placeholder="2026.09"
          />
        </Field>
        <Field label="종료 시점">
          <input name="period_end" defaultValue={defaultValues?.period_end ?? ""} />
        </Field>
      </div>
      <label className="admin-checkbox">
        <input type="checkbox" name="is_featured" defaultChecked={defaultValues?.is_featured} />
        Home의 Featured Projects에 표시
      </label>
      <div className="admin-field">
        <label>대표 이미지</label>
        <ProjectImageUpload defaultValue={defaultValues?.thumbnail_path ?? ""} />
      </div>
      <RichTextEditor defaultValue={defaultValues?.body_text} folder="projects/inline" />
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
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {children}
    </div>
  );
}
