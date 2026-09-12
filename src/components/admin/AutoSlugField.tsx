"use client";

import { useEffect, useState } from "react";
import { createSlugCandidate } from "@/lib/content-slug";

/** 제목 입력을 관찰해 새 콘텐츠의 URL 식별자를 보여 주고, 수정 화면에서는 기존 URL을 유지합니다. */
export function AutoSlugField({
  defaultValue = "",
  prefix,
  titleInputId,
}: {
  defaultValue?: string;
  prefix: "log" | "project";
  titleInputId: string;
}) {
  const [slug, setSlug] = useState(defaultValue);
  const isEditing = Boolean(defaultValue);

  useEffect(() => {
    if (isEditing) return;

    const titleInput = document.getElementById(titleInputId) as HTMLInputElement | null;
    if (!titleInput) return;

    // 부모 폼은 Server Component로 유지하면서 브라우저에서 제목 입력만 가볍게 관찰합니다.
    const updateSlug = () => setSlug(createSlugCandidate(titleInput.value, prefix));
    titleInput.addEventListener("input", updateSlug);
    updateSlug();
    return () => titleInput.removeEventListener("input", updateSlug);
  }, [isEditing, prefix, titleInputId]);

  return (
    <div className="admin-field">
      <label htmlFor="slug">URL 식별자</label>
      <input
        id="slug"
        name="slug"
        readOnly
        required
        value={slug}
        placeholder="제목을 입력하면 자동 생성됩니다"
      />
      <p>
        {isEditing
          ? "기존 공개 URL을 유지합니다. 주소 변경으로 외부 링크가 끊기는 일을 막기 위해서입니다."
          : "제목을 입력하면 자동 생성됩니다. 같은 주소가 있으면 저장할 때 뒤에 번호를 붙입니다."}
      </p>
    </div>
  );
}
