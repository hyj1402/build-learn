// 이 파일은 Log MDX frontmatter와 목록 필터가 사용하는 데이터 모양을 정의합니다.
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
  // 여러 글의 날짜가 같을 때 큰 숫자를 더 최근 작업으로 정렬합니다.
  order?: number;
  // 상세 페이지가 조회될 때마다 DB 함수로 늘어나는 누적 조회수입니다.
  viewCount: number;
  content: string;
};
export type LogFilter = { category?: LogCategory; tag?: string; query?: string };
