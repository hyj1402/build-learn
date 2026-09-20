import { PublicPageLoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// App Router가 페이지 데이터 로딩 중 자동으로 이 화면을 Suspense fallback으로 사용합니다.
export default function Loading() {
  return <PublicPageLoadingSkeleton />;
}
