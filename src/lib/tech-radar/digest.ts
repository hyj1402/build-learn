import Anthropic from "@anthropic-ai/sdk";

export type DigestSourceArticle = {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  sourceName: string;
};

export type DigestResult = {
  overview: string;
  categories: { name: string; articleIds: string[]; blurbs: Record<string, string> }[];
};

// 개인 다이제스트라 비용 대비 충분한 성능의 가벼운 모델을 기본값으로 씁니다.
const MODEL = "claude-haiku-4-5-20251001";

const digestTool: Anthropic.Tool = {
  name: "emit_digest",
  description:
    "수집된 기술 블로그 글들을 주제별로 묶고, 각 글이 무엇을 말하는지 한두 문장으로 요약합니다.",
  input_schema: {
    type: "object",
    properties: {
      overview: {
        type: "string",
        description: "오늘 모은 글들을 관통하는 한두 문장짜리 전체 요약 (한국어)",
      },
      categories: {
        type: "array",
        description: "AI, 백엔드, 프론트엔드, 인프라, 모바일, 기타 등 주제별 묶음",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "카테고리 이름 (한국어, 예: AI, 백엔드, 프론트엔드)",
            },
            articles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  articleId: { type: "string", description: "입력으로 받은 글의 id를 그대로 사용" },
                  blurb: {
                    type: "string",
                    description:
                      "이 글이 무엇을 다루는지 한국어 1~2문장 요약. 원문을 베끼지 말고 핵심 주장만 정리",
                  },
                },
                required: ["articleId", "blurb"],
              },
            },
          },
          required: ["name", "articles"],
        },
      },
    },
    required: ["overview", "categories"],
  },
};

function buildPrompt(articles: DigestSourceArticle[]): string {
  const list = articles
    .map(
      (article) =>
        `- id: ${article.id}\n  출처: ${article.sourceName}\n  제목: ${article.title}\n  RSS 요약: ${article.summary ?? "(요약 없음, 제목만으로 판단)"}`,
    )
    .join("\n");

  return `아래는 오늘 수집된 국내외 기술 블로그 글 목록입니다. 각 글의 "제목"과 "RSS 요약"만 보고,
1) 주제가 비슷한 글끼리 카테고리로 묶고
2) 각 글이 무엇을 말하려는지 한국어로 1~2문장 핵심만 요약해주세요.

중요한 규칙:
- 원문 전체를 읽은 것처럼 세부 사실을 지어내지 마세요. 제목과 RSS 요약에 있는 정보만 사용하세요.
- 광고성 문구나 클릭 유도 표현은 걷어내고 담백하게 요약하세요.
- 카테고리는 4~6개 이내로, 너무 잘게 나누지 마세요.

글 목록:
${list}

emit_digest 도구를 사용해 결과를 반환하세요.`;
}

/** Claude API로 오늘 수집한 글들을 카테고리별 요약으로 정리합니다. */
export async function generateDigest(articles: DigestSourceArticle[]): Promise<DigestResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local에 Claude API 키를 추가해주세요.",
    );
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    tools: [digestTool],
    tool_choice: { type: "tool", name: "emit_digest" },
    messages: [{ role: "user", content: buildPrompt(articles) }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) {
    throw new Error("Claude가 예상한 형식으로 응답하지 않았습니다.");
  }

  const raw = toolUse.input as {
    overview: string;
    categories: { name: string; articles: { articleId: string; blurb: string }[] }[];
  };

  return {
    overview: raw.overview,
    categories: raw.categories.map((category) => ({
      name: category.name,
      articleIds: category.articles.map((item) => item.articleId),
      blurbs: Object.fromEntries(category.articles.map((item) => [item.articleId, item.blurb])),
    })),
  };
}

/** Claude가 정리한 결과와 원본 글 정보를 합쳐, Log 상세 페이지에 그대로 쓸 Markdown 본문을 만듭니다. */
export function renderDigestMarkdown(
  digest: DigestResult,
  articlesById: Map<string, DigestSourceArticle>,
): string {
  const sections = digest.categories
    .map((category) => {
      const items = category.articleIds
        .map((id) => {
          const article = articlesById.get(id);
          if (!article) return null;
          const blurb = category.blurbs[id];
          return `- **[${article.title}](${article.url})** — ${article.sourceName}\n  ${blurb}`;
        })
        .filter(Boolean)
        .join("\n");
      return `## ${category.name}\n\n${items}`;
    })
    .join("\n\n");

  return `> ${digest.overview}\n\n${sections}\n\n> 여기 내용은 각 글의 제목과 요약만 보고 AI가 정리한 것입니다. 자세한 내용은 각 글의 원문 링크에서 확인해주세요.`;
}
