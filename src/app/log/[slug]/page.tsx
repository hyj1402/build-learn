import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/MdxComponents";
import { Badge } from "@/components/ui/Badge";
import { getLogBySlug, getLogs } from "@/lib/logs";
export const dynamicParams = false;
export function generateStaticParams() {
  return getLogs().map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: PageProps<"/log/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const log = getLogBySlug(slug);
  if (!log) return {};
  const image = log.thumbnailImage ?? "/og-default.png";
  return {
    title: log.title,
    description: log.summary,
    openGraph: {
      type: "article",
      title: log.title,
      description: log.summary,
      images: [{ url: image, alt: `${log.title} 대표 이미지` }],
    },
    twitter: {
      card: "summary_large_image",
      title: log.title,
      description: log.summary,
      images: [image],
    },
  };
}
export default async function LogDetail({ params }: PageProps<"/log/[slug]">) {
  const { slug } = await params;
  const log = getLogBySlug(slug);
  if (!log) notFound();
  const { content } = await compileMDX({
    source: log.content,
    components: mdxComponents,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });
  return (
    <article className="container detail">
      <header className="page-header">
        <Badge>{log.category}</Badge>
        <h1>{log.title}</h1>
        <p>{log.summary}</p>
      </header>
      {log.thumbnailImage && (
        <div className="log-detail-image">
          <Image
            src={log.thumbnailImage}
            alt={`${log.title} 대표 이미지`}
            fill
            loading="eager"
            sizes="(max-width: 900px) 100vw, 900px"
          />
        </div>
      )}
      <div className="detail-meta">
        <time dateTime={log.createdAt}>{log.createdAt}</time>
        <div className="tag-row" aria-label="로그 태그">
          {log.tags.map((tag) => (
            <Link key={tag} href={`/log?tag=${encodeURIComponent(tag)}`}>
              <Badge variant="tag">#{tag}</Badge>
            </Link>
          ))}
        </div>
      </div>
      <div className="mdx-content">{content}</div>
    </article>
  );
}
