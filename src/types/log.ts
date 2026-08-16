export type LogCategory = "dev" | "ai" | "life" | "etc";
export type Log = {
  slug: string;
  title: string;
  summary?: string;
  thumbnailImage?: string;
  category: LogCategory;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
  content: string;
};
export type LogFilter = { category?: LogCategory; tag?: string; query?: string };
