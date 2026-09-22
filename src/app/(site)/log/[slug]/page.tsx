import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/MdxComponents";
import { Badge } from "@/components/ui/Badge";
import { CommentSection } from "@/components/log/CommentSection";
import { LogCoverArt } from "@/components/log/LogCoverArt";
import { LogToc } from "@/components/log/LogToc";
import { ReadingProgressBar } from "@/components/log/ReadingProgressBar";
import { LogRelated } from "@/components/log/LogRelated";
import "@/styles/log-detail.css";
import { getSocialImage } from "@/lib/metadata";
import { getPublishedLogBySlug, getPublishedLogs, incrementLogView } from "@/lib/logs-db";
import { extractLogToc } from "@/lib/log-toc";
import { rehypeLogSectionIds } from "@/lib/mdx-log-sections";
import { getLogComments } from "@/lib/comments-db";
import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

/** DB의 ISO 시간을 방문자가 읽기 쉬운 한국 날짜 형식으로 바꿉니다. */
function formatLogDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Markdown 기호를 제외한 한글 글자와 영문 단어 수로 방문자에게 보여줄 예상 읽기 시간을 계산합니다. */
function estimateReadingMinutes(source: string) {
  const plainText = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~-]/g, " ");
  const koreanCharacters = plainText.match(/[가-힣]/g)?.length ?? 0;
  const otherWords = plainText
    .replace(/[가-힣]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(koreanCharacters / 500 + otherWords / 220));
}

/** 현재 Log의 제목·요약·안전한 공유 이미지를 metadata로 만듭니다. */
export async function generateMetadata({ params }: PageProps<"/log/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const log = await getPublishedLogBySlug(slug);
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
  // 이전/다음·더 읽어보기에 전체 목록이 필요하므로, 한 번만 불러온 뒤 그 안에서 현재 글을 찾습니다
  // (slug 하나만 조회하는 getPublishedLogBySlug를 따로 부르면 같은 데이터를 두 번 가져오게 됩니다).
  const allLogs = await getPublishedLogs();
  const log = allLogs.find((item) => item.slug === slug);
  if (!log) notFound();
  // 목차(##)는 h2가 실제로 컴파일되는 순서와 반드시 같아야 하므로, 같은 소스 문자열에서 함께 뽑습니다.
  const toc = extractLogToc(log.content);
  // GFM 문법과 프로젝트 전용 MDX 블록을 서버에서 React 요소로 변환합니다.
  // rehypeLogSectionIds가 h2마다 목차와 같은 순번 id(section-1, section-2…)를 붙입니다.
  const { content } = await compileMDX({
    source: log.content,
    components: mdxComponents,
    options: { mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeLogSectionIds] } },
  });

  // 댓글 목록과 함께, 지금 보는 사람이 로그인한 회원인지·관리자인지도 같이 확인합니다.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [comments, isAdmin] = await Promise.all([
    getLogComments(slug),
    isAdminUser(user),
    incrementLogView(slug),
  ]);
  const readingMinutes = estimateReadingMinutes(log.content);
  return (
    <article className="container detail log-detail">
      {/* 소제목이 둘 이상일 때만 진행 막대·목차를 보여 줍니다. 짧은 글에서는 훑어볼 목차 자체가 의미가 없습니다. */}
      {toc.length > 1 && <ReadingProgressBar />}
      <header className="page-header log-detail-hero">
        {/* 분류를 메인 화면의 eyebrow와 같은 주황 라벨로 보여 주고, 누르면 같은 분류의 Log 목록으로 이동합니다. */}
        <Link className="log-detail-eyebrow" href={`/log?category=${log.category}`}>
          {log.category.toUpperCase()} / LOG
        </Link>
        <h1>{log.title}</h1>
        <p>{log.summary}</p>
        <div className="log-detail-byline" aria-label="글 정보">
          <strong>BUILD &amp; LEARN</strong>
          <span aria-hidden="true">·</span>
          <time dateTime={log.createdAt}>{formatLogDate(log.createdAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingMinutes}분 읽기</span>
          <span aria-hidden="true">·</span>
          <span>조회 {log.viewCount.toLocaleString("ko-KR")}</span>
        </div>
      </header>
      {/* 대표 이미지를 등록하지 않은 글은 분류 색으로 자동 생성한 표지를 대신 보여 줍니다(직접 만들 필요 없음). */}
      <div className="log-detail-image">
        {log.thumbnailImage ? (
          <Image
            src={log.thumbnailImage}
            alt={`${log.title} 대표 이미지`}
            fill
            loading="eager"
            sizes="(max-width: 900px) 100vw, 900px"
          />
        ) : (
          <LogCoverArt category={log.category} slug={log.slug} />
        )}
      </div>
      {log.tags.length > 0 && (
        <nav className="detail-meta log-detail-meta" aria-label="로그 태그">
          <div className="tag-row">
            {log.tags.map((tag) => (
              <Link key={tag} href={`/log?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="tag">#{tag}</Badge>
              </Link>
            ))}
          </div>
        </nav>
      )}
      {toc.length > 1 && <LogToc items={toc} />}
      <div className="mdx-content">{content}</div>
      {log.aiComment && (
        <aside className="ai-comment" aria-labelledby="ai-comment-title">
          <h2 id="ai-comment-title">Claude의 코멘트</h2>
          {/* 줄바꿈은 CSS(white-space)로 살리고 HTML로 해석하지 않아 저장된 텍스트가 그대로 안전하게 표시됩니다. */}
          <p>{log.aiComment}</p>
          <small>AI가 쓴 초안을 글쓴이가 검토해 게시한 코멘트입니다.</small>
        </aside>
      )}
      <LogRelated current={log} all={allLogs} />
      <CommentSection
        contentType="log"
        contentSlug={slug}
        initialComments={comments}
        currentUserId={user?.id ?? null}
        isAdmin={isAdmin}
      />
    </article>
  );
}
