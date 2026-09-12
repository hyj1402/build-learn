"use server";

import { revalidatePath } from "next/cache";
import { deleteManagedStorageFile } from "@/lib/storage-admin";

/** Storage 관리 화면에서 사용자가 명시적으로 선택한 파일만 삭제하고 목록을 새로 읽습니다. */
export async function deleteStorageFile(path: string) {
  await deleteManagedStorageFile(path);
  revalidatePath("/admin/storage");
}
