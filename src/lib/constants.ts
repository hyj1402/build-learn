import type { LogCategory } from "@/types/log";
import type { ProjectCategory } from "@/types/project";
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
