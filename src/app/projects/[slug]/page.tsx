import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/MdxComponents";
import { ProjectDemo } from "@/components/project/ProjectDemo";
import { Badge } from "@/components/ui/Badge";
import { getProjectBySlug, getProjects } from "@/lib/projects";
export const dynamicParams = false;
export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      images: [{ url: project.thumbnailImage, alt: `${project.title} 대표 이미지` }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: [project.thumbnailImage],
    },
  };
}
export default async function ProjectDetail({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
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
