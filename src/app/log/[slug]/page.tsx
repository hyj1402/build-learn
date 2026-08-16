import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/MdxComponents";
import { Badge } from "@/components/ui/Badge";
import { getSocialImage } from "@/lib/metadata";
import { getLogBySlug, getLogs } from "@/lib/logs";

// 빌드 때 만든 공개 Log 주소만 허용하고 나머지는 404로 처리합니다.
export const dynamicParams = false;

/** 공개 Log slug 목록을 Next.js에 알려 상세 페이지를 정적으로 미리 만듭니다. */
export function generateStaticParams() {
  return getLogs().map(({ slug }) => ({ slug }));
}

/** 현재 Log의 제목·요약·안전한 공유 이미지를 metadata로 만듭니다. */
export async function generateMetadata({ params }: PageProps<"/log/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const log = getLogBySlug(slug);
  if (!log) return {};
  const image = getSocialImage(log.thumbnailImage);
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

/** slug에 맞는 Log 정보와 MDX 본문을 하나의 읽기 페이지로 조합합니다. */
export default async function LogDetail({ params }: PageProps<"/log/[slug]">) {
  const { slug } = await params;
  const log = getLogBySlug(slug);
  if (!log) notFound();
  // GFM 문법과 프로젝트 전용 MDX 블록을 서버에서 React 요소로 변환합니다.
  const { content } = await compileMDX({
    source: log.content,
    components: mdxComponents,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });
  return (
    <article className="container detail log-detail">
      <header className="page-header">
        <Badge>{log.category}</Badge>
        <h1>{log.title}</h1>
        <p>{log.summary}</p>
      </header>
      {/* 본문 썸네일은 SVG도 표시할 수 있지만 SNS용 OG 이미지는 별도 함수에서 PNG로 교체합니다. */}
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
