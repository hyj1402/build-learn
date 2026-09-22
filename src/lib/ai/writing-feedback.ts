import Anthropic from "@anthropic-ai/sdk";

export type WritingFeedback = {
  summary: string;
  strengths: string[];
  improvements: { issue: string; suggestion: string }[];
  missingPerspectives: string[];
  nextSteps: string[];
};

type UnknownRecord = Record<string, unknown>;

// 글 한 편에 관리자가 직접 누를 때만 호출되므로, 비용보다 피드백 품질을 우선해 한 단계 큰 모델을 씁니다.
const MODEL = "claude-sonnet-5";

const feedbackTool: Anthropic.Tool = {
  name: "emit_feedback",
  description: "작성자가 쓴 글 초안에 대한 피드백을 구조화해서 돌려줍니다.",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "글 전체에 대한 한두 문장 총평 (한국어)" },
      strengths: {
        type: "array",
        description: "잘 쓴 점 2~4개. 글에 실제로 있는 표현·구성을 근거로 구체적으로",
        items: { type: "string" },
      },
      improvements: {
        type: "array",
        description: "고치면 좋아지는 점 2~5개. 문제와 구체적인 고치는 방법을 함께",
        items: {
          type: "object",
          properties: {
            issue: { type: "string", description: "무엇이 아쉬운지" },
            suggestion: { type: "string", description: "어떻게 고치면 좋은지 (예시 문장 가능)" },
          },
          required: ["issue", "suggestion"],
        },
      },
      missingPerspectives: {
        type: "array",
        description: "글에 빠져 있어서 독자가 궁금해할 만한 관점이나 정보 0~3개",
        items: { type: "string" },
      },
      nextSteps: {
        type: "array",
        description: "다음에 읽으면 좋을 책·공부할 주제·이어 쓸 글 2~4개 (이유 한 줄 포함)",
        items: { type: "string" },
      },
    },
    required: ["summary", "strengths", "improvements", "missingPerspectives", "nextSteps"],
  },
};

const SYSTEM_PROMPT = `당신은 개발자의 개인 기술 블로그 글을 봐주는 따뜻하지만 솔직한 편집자입니다.
글쓴이는 한국어 개발자이고, 이 글은 본인이 직접 쓴 초안입니다.

지켜야 할 규칙:
- 글을 대신 다시 쓰지 마세요. 피드백과 제안만 하고, 예시 문장은 짧게 한두 개만 보여주세요.
- 글쓴이의 말투와 문체(예: "~했다"체)를 존중하고, 문체를 바꾸라고 하지 마세요.
- 글에 없는 사실을 지어내지 마세요. 책이나 자료의 내용을 아는 척 설명하거나 인용하지 마세요.
- 다음에 읽을 책을 추천할 때는 실제로 존재하는 책만, 확신이 없으면 주제만 제안하세요.
- 칭찬은 구체적으로, 지적은 부드럽지만 분명하게 하세요.`;

/** 외부 API의 JSON 값이 객체인지 먼저 좁혀, TypeScript 타입 단언만 믿지 않게 합니다. */
function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 예상한 개수·문자열 형태의 목록만 통과시켜 화면의 map() 렌더링 오류를 막습니다. */
function parseTextList(value: unknown, name: string, min: number, max: number): string[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    throw new Error(`AI ${name} 항목 수가 올바르지 않습니다.`);
  }

  const items = value.map((item) => (typeof item === "string" ? item.trim() : ""));
  if (items.some((item) => !item)) {
    throw new Error(`AI ${name} 항목 형식이 올바르지 않습니다.`);
  }
  return items;
}

/** Claude tool 응답을 실제 화면이 안전하게 표시할 수 있는 WritingFeedback 형태로 검증합니다. */
function parseWritingFeedback(value: unknown): WritingFeedback {
  if (!isRecord(value) || typeof value.summary !== "string" || !value.summary.trim()) {
    throw new Error("AI 총평 형식이 올바르지 않습니다.");
  }

  if (
    !Array.isArray(value.improvements) ||
    value.improvements.length < 1 ||
    value.improvements.length > 7
  ) {
    throw new Error("AI 개선점 항목 수가 올바르지 않습니다.");
  }
  const improvements = value.improvements.map((item) => {
    if (!isRecord(item) || typeof item.issue !== "string" || typeof item.suggestion !== "string") {
      throw new Error("AI 개선점 항목 형식이 올바르지 않습니다.");
    }
    const issue = item.issue.trim();
    const suggestion = item.suggestion.trim();
    if (!issue || !suggestion) throw new Error("AI 개선점 내용이 비어 있습니다.");
    return { issue, suggestion };
  });

  return {
    summary: value.summary.trim(),
    strengths: parseTextList(value.strengths, "잘 쓴 점", 1, 6),
    improvements,
    missingPerspectives: parseTextList(value.missingPerspectives, "빠진 관점", 0, 4),
    nextSteps: parseTextList(value.nextSteps, "다음 단계", 1, 6),
  };
}

/** 글 초안을 Claude에게 보내 총평·잘한 점·개선점·빠진 관점·다음 단계 제안을 받습니다. */
export async function getWritingFeedback(input: {
  title: string;
  kind: "log" | "project";
  markdown: string;
}): Promise<WritingFeedback> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY가 설정되지 않았습니다.");
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [feedbackTool],
    tool_choice: { type: "tool", name: "emit_feedback" },
    messages: [
      {
        role: "user",
        content: `종류: ${input.kind === "log" ? "학습 기록(Log)" : "프로젝트 소개"}\n제목: ${
          input.title || "(제목 없음)"
        }\n\n아래는 글 초안(Markdown)입니다.\n\n<draft>\n${input.markdown}\n</draft>\n\nemit_feedback 도구로 피드백을 반환하세요.`,
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) throw new Error("Claude가 예상한 형식으로 응답하지 않았습니다.");

  // Tool schema는 모델이 지켜야 할 약속이고, 이 검증은 약속이 어겨졌을 때 관리자 화면을 보호하는 마지막 안전망입니다.
  return parseWritingFeedback(toolUse.input);
}
