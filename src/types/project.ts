// 이 파일은 프로젝트 MDX frontmatter가 가질 수 있는 데이터 모양을 정의합니다.
export type ProjectCategory = "web" | "app" | "game" | "experiment";
export type ProjectStatus = "completed" | "in-progress" | "archived";
export type ProjectDemoType = "embed" | "link" | "download";
export type Project = {
  // slug는 파일명에서 만든 URL 식별자입니다. 예: build-and-learn.mdx → build-and-learn
  slug: string;
  title: string;
  summary: string;
  thumbnailImage: string;
  category: ProjectCategory;
  status: ProjectStatus;
  techStack: string[];
  period: { start: string; end?: string };
  githubUrl?: string;
  demoType?: ProjectDemoType;
  demoUrl?: string;
  downloadUrl?: string;
  isPublished: boolean;
  // Home의 Featured Projects에 포함할지를 결정합니다.
  isFeatured: boolean;
  // 상세 페이지가 조회될 때마다 DB 함수로 늘어나는 누적 조회수입니다.
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
  content: string;
};
// 값이 없는 조건은 필터하지 않는다는 의미입니다.
export type ProjectFilter = { category?: ProjectCategory; query?: string; featured?: boolean };
