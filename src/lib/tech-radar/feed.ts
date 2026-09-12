import Parser from "rss-parser";

// rss-parser는 RSS 2.0(당근/토스/배민)과 Atom(네이버 D2)의 서로 다른 태그 이름을
// (item/entry, pubDate/updated, guid/id 등) 자동으로 같은 모양으로 통일해서 돌려줍니다.
const parser = new Parser({
  headers: {
    // 일부 사이트는 흔한 크롤러 User-Agent를 차단하므로, 일반 브라우저처럼 보이게 지정합니다.
    "User-Agent": "Mozilla/5.0 (compatible; build-learn-tech-radar/1.0)",
    // rss-parser의 기본값은 Accept: application/rss+xml만 보내는데, Atom 피드(네이버 D2)를
    // 이 값으로 요청하면 서버가 406으로 거부합니다. RSS/Atom 둘 다 받아들이도록 명시합니다.
    Accept:
      "application/atom+xml, application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
  },
  timeout: 15000,
});

export type FeedArticle = {
  title: string;
  url: string;
  summary: string | null;
  publishedAt: string | null;
};

// 대부분의 블로그는 최근 10~20개만 피드에 담지만, 개중에는(OpenAI News처럼) 개설 이후 전체
// 글을 담아주는 곳도 있습니다. 그런 피드를 만나도 한 번에 수백~수천 건이 들어가지 않도록
// "최근 N일 이내" + "최대 건수"라는 두 겹의 안전장치를 둡니다.
const MAX_ARTICLE_AGE_DAYS = 14;
const MAX_ARTICLES_PER_FETCH = 50;

/**
 * 하나의 RSS/Atom 피드 주소를 읽어 제목·링크·요약·발행일만 뽑아냅니다.
 * 본문 전체(content:encoded 등)는 저작권 문제를 피하려고 의도적으로 저장하지 않습니다.
 */
export async function fetchFeedArticles(feedUrl: string): Promise<FeedArticle[]> {
  const feed = await parser.parseURL(feedUrl);
  const cutoff = Date.now() - MAX_ARTICLE_AGE_DAYS * 24 * 60 * 60 * 1000;

  return (
    (feed.items ?? [])
      .filter((item) => item.link && item.title)
      .map((item) => ({
        title: item.title!.trim(),
        url: item.link!.trim(),
        // contentSnippet은 rss-parser가 HTML 태그를 제거해 만든 순수 텍스트 요약입니다.
        summary: item.contentSnippet?.trim().slice(0, 500) || null,
        // isoDate는 pubDate/updated 어느 쪽이든 표준 ISO 문자열로 정규화된 값입니다.
        publishedAt: item.isoDate ?? null,
      }))
      // 발행일을 알 수 없는 글은 최근 글일 수도 있어 일단 포함하고, 날짜가 있으면 오래된 것만 걸러냅니다.
      .filter(
        (article) => !article.publishedAt || new Date(article.publishedAt).getTime() >= cutoff,
      )
      .slice(0, MAX_ARTICLES_PER_FETCH)
  );
}
