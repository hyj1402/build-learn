"use client";

import { useRef, useState } from "react";
import { ContentImageUpload } from "@/components/admin/ContentImageUpload";

/** Markdown 본문에 이미지 URL을 현재 커서 위치로 삽입하는 가벼운 Log 전용 에디터입니다. */
export function LogBodyEditor({ defaultValue = "" }: { defaultValue?: string }) {
  const [body, setBody] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** 업로드된 공개 URL을 Markdown 이미지 문법으로 바꾸어 본문 커서 위치에 넣습니다. */
  function insertImage(url: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const markdown = `\n![이미지 설명](${url})\n`;
    const nextBody = `${body.slice(0, start)}${markdown}${body.slice(end)}`;
    setBody(nextBody);

    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + markdown.length, start + markdown.length);
    });
  }

  return (
    <div className="admin-field log-body-editor">
      <label htmlFor="body_text">
        본문 <span aria-hidden="true">*</span>
      </label>
      <textarea
        ref={textareaRef}
        id="body_text"
        name="body_text"
        required
        rows={18}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Markdown 문법으로 작성할 수 있습니다. 리치 텍스트 에디터는 다음 단계에서 추가됩니다."
      />
      <div className="log-body-editor-upload">
        <strong>본문 이미지</strong>
        <ContentImageUpload folder="logs/inline" onUploaded={insertImage} variant="inline" />
        <p>업로드가 끝나면 현재 커서 위치에 Markdown 이미지 문법이 자동으로 들어갑니다.</p>
      </div>
    </div>
  );
}
