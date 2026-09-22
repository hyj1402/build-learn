"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { AiFeedbackPanel } from "@/components/admin/AiFeedbackPanel";
import { ContentImageUpload, uploadContentImage } from "@/components/admin/ContentImageUpload";

type ImageFolder = "projects/inline" | "logs/inline";

/**
 * Markdown을 읽고 다시 Markdown으로 저장하는 공용 리치 텍스트 에디터입니다.
 * TipTap의 화면 편집 기능은 Client Component에서만 동작하고, hidden input의 값은 기존 Server Action이 받는 body_text와 호환됩니다.
 */
export function RichTextEditor({
  defaultValue = "",
  folder,
}: {
  defaultValue?: string;
  folder: ImageFolder;
}) {
  const [markdown, setMarkdown] = useState(defaultValue);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isInlineUploading, setIsInlineUploading] = useState(false);
  // 편집 화면과 실제 공개 화면 모양을 오가며 확인하는 미리보기 상태입니다.
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [previewHtml, setPreviewHtml] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, defaultProtocol: "https" }),
      Image.configure({ allowBase64: false }),
      Markdown,
    ],
    content: defaultValue,
    contentType: "markdown",
    // Next.js는 서버 렌더링을 먼저 하므로, 브라우저에서만 편집기를 그려 hydration 불일치를 막습니다.
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => setMarkdown(currentEditor.getMarkdown()),
    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
        "aria-label": "본문 편집기",
      },
      // ProseMirror의 기본 파일 붙여넣기 동작 대신, 이미지를 압축·업로드한 URL로 교체합니다.
      handlePaste: (_view, event) => {
        const image = Array.from(event.clipboardData?.files ?? []).find((file) =>
          file.type.startsWith("image/"),
        );
        if (!image) return false;
        event.preventDefault();
        void uploadAndInsertImage(image);
        return true;
      },
      // 에디터 안에 드롭한 이미지만 가로채고, 텍스트 드롭처럼 원래 편집기 동작이 필요한 경우는 그대로 둡니다.
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const image = Array.from(event.dataTransfer?.files ?? []).find((file) =>
          file.type.startsWith("image/"),
        );
        if (!image) return false;
        event.preventDefault();
        setIsImageDragging(false);
        void uploadAndInsertImage(image);
        return true;
      },
    },
  });

  /** Storage에 올라간 이미지 URL을 현재 커서 위치에 실제 이미지 블록으로 넣습니다. */
  function insertImage(url: string) {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url, alt: "본문 이미지" }).run();
    setMarkdown(editor.getMarkdown());
  }

  /**
   * 드롭하거나 붙여넣은 이미지도 버튼 업로드와 똑같이 WebP 최적화·1MB 제한을 거친 뒤 현재 커서에 삽입합니다.
   * `editor`는 Client Component가 준비된 뒤에만 존재하므로, 업로드를 시작하기 전에 한 번 더 확인합니다.
   */
  async function uploadAndInsertImage(file: File) {
    if (!editor) return;
    setIsInlineUploading(true);
    setUploadMessage("이미지를 최적화하고 업로드하는 중입니다…");
    try {
      const uploaded = await uploadContentImage(file, folder, "inline");
      insertImage(uploaded.url);
      setUploadMessage(`본문 이미지 삽입 완료 · ${(uploaded.size / 1024).toFixed(0)}KB`);
    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "본문 이미지 업로드에 실패했습니다.",
      );
    } finally {
      setIsInlineUploading(false);
    }
  }

  /** 링크 주소를 입력받아 선택한 글자에 연결하거나, 이미 연결된 링크를 제거합니다. */
  function toggleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("연결할 주소를 입력하세요", "https://");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  /** 현재 편집 내용을 HTML로 바꿔 미리보기에 씁니다. 편집기는 언마운트하지 않고 숨겨서 커서·되돌리기 기록을 유지합니다. */
  function switchMode(next: "edit" | "preview") {
    if (next === "preview" && editor) setPreviewHtml(editor.getHTML());
    setMode(next);
  }

  // 공개 화면과 같은 글꼴·폭이 적용되도록, Log는 상세 페이지와 같은 래퍼 클래스를 씁니다.
  const previewWrapperClass = folder.startsWith("logs") ? "log-detail" : "project-detail";

  return (
    <div
      className={`admin-field rich-text-editor${isImageDragging ? " is-image-dragging" : ""}`}
      onDragLeave={() => setIsImageDragging(false)}
      onDragOver={(event) => {
        if (!Array.from(event.dataTransfer.types).includes("Files")) return;
        event.preventDefault();
        setIsImageDragging(true);
      }}
    >
      <div className="rich-text-editor-heading">
        <label htmlFor="body_text">상세 내용</label>
        <div className="rich-text-editor-modes" role="tablist" aria-label="편집 방식">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "edit"}
            className={mode === "edit" ? "is-active" : ""}
            onClick={() => switchMode("edit")}
          >
            편집
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preview"}
            className={mode === "preview" ? "is-active" : ""}
            onClick={() => switchMode("preview")}
          >
            미리보기
          </button>
        </div>
        <span>작성 내용은 Markdown으로 저장됩니다.</span>
      </div>
      {/* Server Action은 FormData만 받으므로, 에디터의 Markdown 값을 기존 body_text 필드에 숨겨서 함께 제출합니다. */}
      <input id="body_text" name="body_text" type="hidden" value={markdown} />
      {mode === "preview" && (
        <div className="rich-text-editor-preview">
          <p className="rich-text-editor-preview-note">
            본문 글꼴·간격 미리보기입니다. 표·체크박스·Callout 등 일부 Markdown 요소는 공개 화면과
            다를 수 있습니다.
          </p>
          <div className={previewWrapperClass}>
            {previewHtml && previewHtml !== "<p></p>" ? (
              <div className="mdx-content" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p className="rich-text-editor-preview-empty">아직 작성한 내용이 없습니다.</p>
            )}
          </div>
        </div>
      )}
      <div className="rich-text-editor-pane" hidden={mode === "preview"}>
        <EditorToolbar editor={editor} onLink={toggleLink} />
        <EditorContent editor={editor} />
        {isImageDragging ? (
          <div className="rich-text-editor-drop-guide">여기에 이미지를 놓으세요</div>
        ) : null}
        <div className="rich-text-editor-upload">
          <strong>본문 이미지</strong>
          <ContentImageUpload folder={folder} onUploaded={insertImage} variant="inline" />
          <p>
            버튼으로 선택하거나, 편집기 안에 이미지를 끌어놓고 캡처 이미지를 붙여넣을 수 있습니다.
            이미지는 가로 1,920px 이하·최종 1MB 이하로 최적화됩니다.
          </p>
          {isInlineUploading || uploadMessage ? <p role="status">{uploadMessage}</p> : null}
        </div>
      </div>
      <AiFeedbackPanel
        getMarkdown={() => editor?.getMarkdown() ?? markdown}
        kind={folder.startsWith("logs") ? "log" : "project"}
      />
    </div>
  );
}

/** 서식 명령을 버튼으로 노출해 Markdown 문법을 외우지 않아도 글을 작성할 수 있게 합니다. */
function EditorToolbar({ editor, onLink }: { editor: Editor | null; onLink: () => void }) {
  if (!editor) {
    return (
      <div className="rich-text-editor-toolbar" aria-busy="true">
        편집기를 준비하는 중입니다…
      </div>
    );
  }

  const tools = [
    {
      label: "굵게",
      short: "B",
      active: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "기울임",
      short: "I",
      active: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "제목 2",
      short: "H2",
      active: editor.isActive("heading", { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "제목 3",
      short: "H3",
      active: editor.isActive("heading", { level: 3 }),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "글머리 목록",
      short: "•",
      active: editor.isActive("bulletList"),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "번호 목록",
      short: "1.",
      active: editor.isActive("orderedList"),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "인용",
      short: "❝",
      active: editor.isActive("blockquote"),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "코드 블록",
      short: "</>",
      active: editor.isActive("codeBlock"),
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];

  return (
    <div className="rich-text-editor-toolbar" role="toolbar" aria-label="본문 서식 도구">
      {tools.map((tool) => (
        <button
          aria-label={tool.label}
          aria-pressed={tool.active}
          className={tool.active ? "is-active" : ""}
          key={tool.label}
          onClick={tool.action}
          type="button"
        >
          {tool.short}
        </button>
      ))}
      <span aria-hidden="true" className="rich-text-editor-divider" />
      <button
        aria-label="링크"
        aria-pressed={editor.isActive("link")}
        className={editor.isActive("link") ? "is-active" : ""}
        onClick={onLink}
        type="button"
      >
        🔗
      </button>
      <span aria-hidden="true" className="rich-text-editor-divider" />
      <button
        aria-label="실행 취소"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
        type="button"
      >
        ↶
      </button>
      <button
        aria-label="다시 실행"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
        type="button"
      >
        ↷
      </button>
    </div>
  );
}
