import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/MdxComponents";
import { ProjectDemo } from "@/components/project/ProjectDemo";
import { Badge } from "@/components/ui/Badge";
import { getSocialImage } from "@/lib/metadata";
import { getProjectBySlug, getProjects } from "@/lib/projects";

// 빌드 때 만든 slug 외의 임의 주소는 동적 생성하지 않고 404로 처리합니다.
export const dynamicParams = false;

/** 공개 프로젝트 slug 목록을 Next.js에 알려 상세 페이지를 빌드 시 미리 생성합니다. */
export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}

/** 각 프로젝트 내용에 맞는 검색·SNS 공유 metadata를 생성합니다. */
export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  // SVG 썸네일은 공유 서비스 호환성이 낮으므로 getSocialImage가 공용 PNG로 바꿉니다.
  const image = getSocialImage(project.thumbnailImage);
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      images: [{ url: image, alt: `${project.title} 대표 이미지` }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: [image],
    },
  };
}

/** slug에 맞는 프로젝트 frontmatter, 데모, MDX 본문을 조합한 상세 페이지입니다. */
export default async function ProjectDetail({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  // remark-gfm은 표와 체크박스를, mdxComponents는 Callout과 InputBox를 사용할 수 있게 합니다.
  const { content } = await compileMDX({
    source: project.content,
    components: mdxComponents,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });
  return (
    <article className="container detail">
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
