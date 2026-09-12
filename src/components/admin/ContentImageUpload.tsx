"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 1024 * 1024;
const MAX_WIDTH = 1920;
const BANNER_WIDTH = 1920;
const BANNER_HEIGHT = 1080;

export type ContentImageFolder = "projects" | "projects/inline" | "logs" | "logs/inline";
export type ContentImageVariant = "banner" | "inline";

/**
 * 파일 하나를 용도별 규격으로 WebP 변환한 뒤 Storage에 올리고, 공개 URL과 최종 용량을 반환합니다.
 * 파일 선택·드래그앤드롭·붙여넣기가 같은 품질과 용량 제한을 쓰도록 업로드 본문을 공용 함수로 분리했습니다.
 */
export async function uploadContentImage(
  file: File,
  folder: ContentImageFolder,
  variant: ContentImageVariant = "banner",
) {
  if (!/image\/(jpeg|png|webp)/.test(file.type)) {
    throw new Error("JPG, PNG, WebP 이미지만 올릴 수 있습니다.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("이미지 캔버스를 만들지 못했습니다.");

    if (variant === "banner") {
      // 원본은 자르지 않고 16:9 배너의 중앙에 맞춰, 어떤 화면에서도 같은 비율을 유지합니다.
      const scale = Math.min(BANNER_WIDTH / bitmap.width, BANNER_HEIGHT / bitmap.height);
      const drawWidth = Math.round(bitmap.width * scale);
      const drawHeight = Math.round(bitmap.height * scale);
      canvas.width = BANNER_WIDTH;
      canvas.height = BANNER_HEIGHT;
      context.fillStyle = "#f6f6f1";
      context.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);
      context.drawImage(
        bitmap,
        Math.round((BANNER_WIDTH - drawWidth) / 2),
        Math.round((BANNER_HEIGHT - drawHeight) / 2),
        drawWidth,
        drawHeight,
      );
    } else {
      // 본문 이미지는 여백을 넣지 않고 원본 비율을 유지한 채 가로 크기만 제한합니다.
      const scale = Math.min(1, MAX_WIDTH / bitmap.width);
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.8),
    );
    if (!blob) throw new Error("이미지를 WebP로 변환하지 못했습니다.");
    if (blob.size > MAX_BYTES) {
      throw new Error("최적화 후에도 1MB를 넘습니다. 더 작은 원본 이미지를 선택해주세요.");
    }

    const path = `${folder}/${crypto.randomUUID()}.webp`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("content-images").upload(path, blob, {
      contentType: "image/webp",
      cacheControl: "31536000",
    });
    if (error) throw error;

    const { data } = supabase.storage.from("content-images").getPublicUrl(path);
    return { url: data.publicUrl, size: blob.size };
  } finally {
    bitmap.close();
  }
}

/** 대표 배너 또는 본문 이미지를 WebP로 최적화해 content-images 버킷에 올리는 공용 업로더입니다. */
export function ContentImageUpload({
  defaultValue = "",
  fieldName,
  folder,
  onUploaded,
  variant = "banner",
}: {
  defaultValue?: string;
  fieldName?: string;
  folder: ContentImageFolder;
  onUploaded?: (url: string) => void;
  variant?: ContentImageVariant;
}) {
  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  /** 선택한 파일을 용도별 규격으로 줄이고, 성공 시 공개 URL을 부모 폼에 전달합니다. */
  async function uploadImage(file: File) {
    setIsUploading(true);
    setMessage("이미지를 최적화하는 중입니다…");
    try {
      const uploaded = await uploadContentImage(file, folder, variant);
      setImageUrl(uploaded.url);
      onUploaded?.(uploaded.url);
      setMessage(`업로드 완료 · ${(uploaded.size / 1024).toFixed(0)}KB`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="content-image-upload">
      {fieldName ? <input name={fieldName} type="hidden" value={imageUrl} /> : null}
      {imageUrl ? <img alt="선택한 이미지 미리보기" src={imageUrl} /> : null}
      <label className="admin-action-button admin-action-outline-blue">
        {isUploading ? "업로드 중…" : imageUrl ? "이미지 교체" : "이미지 선택"}
        <input
          accept="image/jpeg,image/png,image/webp"
          disabled={isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadImage(file);
          }}
          type="file"
        />
      </label>
      {imageUrl && fieldName ? (
        <button
          className="admin-action-button admin-action-ghost-danger"
          onClick={() => setImageUrl("")}
          type="button"
        >
          이미지 제거
        </button>
      ) : null}
      <p>
        JPG, PNG, WebP · {variant === "banner" ? "1,920 × 1,080px 배너" : "가로 1,920px 이하"} ·
        최종 1MB 이하
      </p>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
