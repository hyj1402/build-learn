/** Tech Radar 글의 성격을 나타내는 값과, 관리자에게 보여 줄 이름을 한곳에서 관리합니다. */
export const TECH_ARTICLE_TOPICS = {
  ai_development: "개발·AI 기술",
  product: "제품 소식",
  company: "회사·정책·협업",
  review: "검토 필요",
} as const;

export type TechArticleTopic = keyof typeof TECH_ARTICLE_TOPICS;

const companyTerms = [
  "partnership",
  "partner",
  "collaboration",
  "collaborate",
  "policy",
  "governance",
  "leadership",
  "hiring",
  "nonprofit",
  "economic",
  "investment",
  "협업",
  "파트너십",
  "정책",
  "채용",
  "행사",
];
const developmentTerms = [
  "api",
  "sdk",
  "codex",
  "developer",
  "developers",
  "agent",
  "agents",
  "model spec",
  "research",
  "benchmark",
  "evaluation",
  "eval",
  "fine-tune",
  "fine-tuning",
  "open source",
  "function calling",
  "mcp",
  "reasoning",
  "gpt",
  "webview",
  "authentication",
  "frontend",
  "backend",
  "infrastructure",
  "database",
  "typescript",
  "javascript",
  "android",
  "kotlin",
  "swift",
  "python",
  "security",
  "performance",
  "architecture",
  "모델",
  "개발자",
  "에이전트",
  "연구",
  "평가",
  "벤치마크",
  "인증",
  "프론트엔드",
  "백엔드",
  "인프라",
  "데이터베이스",
  "보안",
  "성능",
  "아키텍처",
];
const productTerms = [
  "chatgpt",
  "sora",
  "operator",
  "atlas",
  "app",
  "desktop",
  "mobile",
  "launch",
  "introducing",
  "release",
  "product",
  "출시",
  "앱",
  "제품",
];

/**
 * 키워드가 다른 단어의 일부일 때(capital 속 api, approach 속 app 등) 잘못 걸리지 않도록,
 * 영문 키워드는 단어 경계와 흔한 어미(s, ed, ing, er…)까지만 허용해 찾고 한글 키워드는 포함 여부로 찾습니다.
 */
function matchesTerm(text: string, term: string): boolean {
  if (/[^\x00-\x7f]/.test(term)) return text.includes(term);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z0-9])${escaped}(?:s|es|ed|ing|er|ers)?(?![a-z0-9])`).test(text);
}

/** 외부 RSS의 제목·요약을 무료 키워드 규칙으로 1차 분류합니다. 애매한 글은 버리지 않고 review로 남깁니다. */
export function classifyTechArticle(input: {
  title: string;
  summary: string | null;
}): TechArticleTopic {
  const text = `${input.title}\n${input.summary ?? ""}`.toLocaleLowerCase("en-US");
  const includesAny = (terms: string[]) => terms.some((term) => matchesTerm(text, term));

  // 기업 협업·정책 글은 API 같은 단어가 곁들여져도 운영 소식으로 우선 분류합니다.
  if (includesAny(companyTerms)) return "company";
  if (includesAny(developmentTerms)) return "ai_development";
  if (includesAny(productTerms)) return "product";
  return "review";
}

/** 외부 요청으로 넘어온 문자열이 허용된 분류값인지 확인해 Server Action 입력을 안전하게 제한합니다. */
export function isTechArticleTopic(value: string): value is TechArticleTopic {
  return Object.hasOwn(TECH_ARTICLE_TOPICS, value);
}
