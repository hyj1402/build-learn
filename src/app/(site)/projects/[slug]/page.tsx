import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/MdxComponents";
import { ProjectDemo } from "@/components/project/ProjectDemo";
import { Badge } from "@/components/ui/Badge";
import { getPublishedProjectBySlug } from "@/lib/projects-db";

/** 각 프로젝트 내용에 맞는 검색·SNS 공유 metadata를 생성합니다. */
export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
    },
    twitter: {
      card: "summary",
      title: project.title,
      description: project.summary,
    },
  };
}

/** slug에 맞는 공개 DB 프로젝트를 읽어 상세 페이지를 구성합니다. */
export default async function ProjectDetail({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();
  // 관리자 리치 에디터가 저장한 Markdown을 기존 Log와 같은 읽기 UI로 변환합니다.
  const { content } = await compileMDX({
    source: project.content,
    components: mdxComponents,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });
  return (
    <article className="container detail">
      {project.thumbnailImage && (
        <div className="project-detail-cover">
          <Image
            src={project.thumbnailImage}
            alt={`${project.title} 대표 이미지`}
            fill
            priority
            sizes="(max-width: 800px) 100vw, 1180px"
          />
        </div>
      )}
      <header className="page-header">
        <div className="tag-row">
          <Badge>{project.category}</Badge>
          <Badge variant="tag">{project.status}</Badge>
        </div>
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
      </header>
      <div className="detail-meta">
        <span>
          {project.period.start} — {project.period.end ?? "진행 중"}
        </span>
        <span>{project.techStack.join(" · ")}</span>
      </div>
      <ProjectDemo project={project} />
      <div className="mdx-content">{content}</div>
    </article>
  );
}
