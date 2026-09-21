import type { LogCategory } from "@/types/log";
import type { ProjectCategory } from "@/types/project";

// 화면의 필터 메뉴와 TypeScript 타입이 서로 다른 값을 갖지 않도록 한곳에서 관리합니다.
export const PROJECT_CATEGORIES = [
  "web",
  "app",
  "game",
  "experiment",
] as const satisfies readonly ProjectCategory[];
export const LOG_CATEGORIES = [
  "dev",
  "ai",
  "life",
  "etc",
] as const satisfies readonly LogCategory[];

// 공개 Log 탭과 관리자 작성 폼이 같은 저장값을 사용하도록 분류 이름도 함께 관리합니다.
// URL·DB에는 짧은 slug를 저장하고, 화면에는 글의 성격을 이해하기 쉬운 이름을 보여 줍니다.
export const LOG_CATEGORY_OPTIONS = [
  { value: "dev", label: "DEV · 개발" },
  { value: "ai", label: "AI · AI 활용" },
  { value: "life", label: "LIFE · 회고" },
  { value: "etc", label: "ETC · 기타" },
] as const satisfies ReadonlyArray<{ value: LogCategory; label: string }>;

// 대표 이미지를 등록하지 않은 프로젝트가 함께 쓰는 기본 이미지("지금까지 참여한 실무 프로젝트"의 대표 이미지)입니다.
// 각 프로젝트 행에 이 주소를 복사해 저장하면 한 프로젝트를 수정·삭제할 때 공유 파일이 Storage에서 지워지므로,
// DB에는 빈 값으로 두고 화면에 보여 줄 때만 대신 사용합니다.
export const DEFAULT_PROJECT_THUMBNAIL =
  "https://ygcksiktoeewtxujqfig.supabase.co/storage/v1/object/public/content-images/projects/87e60ca6-b19d-43b2-8f27-a288dee7d2a7.webp";
