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
