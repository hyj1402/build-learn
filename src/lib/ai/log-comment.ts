import Anthropic from "@anthropic-ai/sdk";

// 관리자가 버튼을 눌렀을 때만 글 한 편당 한 번 호출하므로 비용보다 코멘트 품질을 우선합니다.
const MODEL = "claude-sonnet-5";
const MAX_GENERATED_COMMENT_LENGTH = 600;

const SYSTEM_PROMPT = `당신은 Claude입니다. 한국어 개발자의 개인 학습 기록 사이트(BUILD & LEARN)에서, 글을 읽은 독자에게 보이는 "Claude의 코멘트"를 씁니다.
이 코멘트는 관리자가 검토하고 고친 뒤에 공개됩니다.

지켜야 할 규칙:
- 스스로를 Claude라고 밝히는 1인칭 시점으로, 글쓴이가 아니라 독자에게 말하듯 쓰세요.
- 글의 핵심이 무엇이고 어떤 점이 인상적인지, 독자가 이 글에서 무엇을 얻을 수 있는지를 2~3개의 짧은 문단으로 쓰세요. 전체 600자 이내.
- 글에 없는 사실을 지어내지 마세요. 책이나 자료의 내용을 아는 척 설명하거나 인용하지 마세요.
- 과장된 칭찬과 광고 문구를 쓰지 마세요. 글쓴이의 말투를 흉내 내거나 글쓴이인 척하지 마세요.
- Markdown 문법(제목, 목록, 굵게)을 쓰지 말고 평문 문단만 쓰세요.`;

/**
 * 모델이 프롬프트의 글자 수 요청을 어겼을 때도 공개 초안의 약속을 지킵니다.
 * 관리자가 직접 고치는 코멘트는 DB 허용 범위(3,000자)를 그대로 사용하고, 여기서는 AI 초안만 제한합니다.
 */
function limitGeneratedComment(text: string) {
  if (text.length <= MAX_GENERATED_COMMENT_LENGTH) return text;
  return `${text.slice(0, MAX_GENERATED_COMMENT_LENGTH - 1).trimEnd()}…`;
}

/** 글 본문을 Claude에게 보내 독자용 공개 코멘트 초안(평문)을 받고, 최대 600자로 제한합니다. */
export async function generateLogComment(input: {
  title: string;
  markdown: string;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY가 설정되지 않았습니다.");
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `제목: ${input.title || "(제목 없음)"}\n\n아래는 글 본문(Markdown)입니다.\n\n<post>\n${input.markdown}\n</post>\n\n이 글에 대한 Claude의 코멘트를 평문으로만 써주세요.`,
      },
    ],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("Claude가 빈 응답을 돌려줬습니다.");
  return limitGeneratedComment(text);
}
