import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "content-images";
const PUBLIC_URL_PREFIX =
  "https://ygcksiktoeewtxujqfig.supabase.co/storage/v1/object/public/content-images/";

export const STORAGE_WARNING_BYTES = 700 * 1024 * 1024;
export const LARGE_FILE_BYTES = 512 * 1024;

export type StorageFile = {
  createdAt: string | null;
  isUsed: boolean;
  path: string;
  size: number;
};

/** 관리자 권한으로 버킷의 폴더를 재귀 조회해 실제 파일만 한 목록으로 만듭니다. */
async function listFolder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  folder: string,
): Promise<Omit<StorageFile, "isUsed">[]> {
  const files: Omit<StorageFile, "isUsed">[] = [];
  const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw new Error(`Storage 파일을 불러오지 못했습니다: ${error.message}`);

  for (const entry of data) {
    const path = `${folder}/${entry.name}`;
    if (!entry.id) {
      files.push(...(await listFolder(supabase, path)));
      continue;
    }
    files.push({
      path,
      size: Number(entry.metadata?.size ?? 0),
      createdAt: entry.created_at ?? null,
    });
  }
  return files;
}

/** 대표 이미지와 Log 본문 Markdown을 함께 검사해 어떤 Storage 파일이 실제 사용 중인지 판단합니다. */
export async function getStorageOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdminUser(user))) throw new Error("관리자만 Storage를 볼 수 있습니다.");

  const [{ data: projects, error: projectError }, { data: logs, error: logError }] =
    await Promise.all([
      supabase.from("projects").select("thumbnail_path"),
      supabase.from("logs").select("thumbnail_path, body_text"),
    ]);
  if (projectError || logError) throw new Error("콘텐츠의 이미지 사용 여부를 확인하지 못했습니다.");

  const [projectFiles, logFiles] = await Promise.all([
    listFolder(supabase, "projects"),
    listFolder(supabase, "logs"),
  ]);
  const referencedUrls = new Set(
    [...(projects ?? []), ...(logs ?? [])]
      .map((content) => content.thumbnail_path)
      .filter((url): url is string => Boolean(url)),
  );
  const logBodies = (logs ?? []).map((log) => log.body_text ?? "");
  const files = [...projectFiles, ...logFiles]
    .map((file) => {
      const publicUrl = `${PUBLIC_URL_PREFIX}${file.path}`;
      return {
        ...file,
        isUsed: referencedUrls.has(publicUrl) || logBodies.some((body) => body.includes(publicUrl)),
      };
    })
    .sort((a, b) => b.size - a.size);

  return {
    files,
    totalBytes: files.reduce((total, file) => total + file.size, 0),
    unusedFiles: files.filter((file) => !file.isUsed),
  };
}

/** 관리자 화면의 삭제 버튼이 Storage 버킷 밖의 경로를 지우지 못하도록 검증한 뒤 파일 하나를 제거합니다. */
export async function deleteManagedStorageFile(path: string) {
  if (!/^(projects|logs)\/[a-z0-9/-]+\.webp$/i.test(path)) {
    throw new Error("허용되지 않은 파일 경로입니다.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdminUser(user))) throw new Error("관리자만 파일을 삭제할 수 있습니다.");

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`파일을 삭제하지 못했습니다: ${error.message}`);
}
