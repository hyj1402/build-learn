import { AdminListLoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// 관리자 레이아웃은 남겨 둔 채, 목록 페이지가 바뀌는 동안 표 형태의 뼈대를 먼저 보여줍니다.
export default function Loading() {
  return <AdminListLoadingSkeleton />;
}
