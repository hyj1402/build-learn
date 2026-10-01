import Anthropic from "@anthropic-ai/sdk";

export type CommentModerationResult = {
  /** true면 댓글을 저장하지 않고 reason을 사용자에게 보여줍니다. */
  blocked: boolean;
  reason?: string;
};

// 댓글이 등록될 때마다(회원이 글을 남길 때마다) 자동으로 호출되는 기능이라,
// 글쓰기 피드백(writing-feedback.ts)처럼 사람이 직접 누르는 기능과 달리 더 가볍고 빠른 모델을 씁니다.
const MODEL = "claude-haiku-4-5-20251001";

const moderationTool: Anthropic.Tool = {
  name: "emit_moderation",
  description: "댓글 하나를 검토해 등록을 허용할지 판단합니다.",
  input_schema: {
    type: "object",
    properties: {
      verdict: {
        type: "string",
        enum: ["allow", "reject"],
        description: "allow: 그대로 등록. reject: 스팸·광고·욕설·혐오·괴롭힘이라 등록을 막아야 함",
      },
      category: {
        type: "string",
        enum: ["none", "spam", "abuse"],
        description: "reject일 때만 의미 있음. spam: 광고·링크 도배. abuse: 욕설·혐오·괴롭힘",
      },
      reason: {
        type: "string",
        description: "reject일 때 작성자에게 보여줄 한국어 안내 한 문장. allow면 빈 문자열",
      },
    },
    required: ["verdict", "category", "reason"],
  },
};

const SYSTEM_PROMPT = `당신은 한국어 개인 개발 블로그(BUILD & LEARN)의 공개 댓글을 검토하는 모더레이터입니다.
로그인한 회원이 Log·Project 글에 남긴 댓글 하나를 보고 등록을 허용할지 판단하세요.

판단 기준:
- 광고·홍보 링크 도배, 같은 내용 반복, 전혀 무관한 스팸은 reject(spam)로 판단하세요.
- 욕설, 혐오 표현, 특정 집단·개인을 향한 모욕이나 괴롭힘은 reject(abuse)로 판단하세요.
- 글에 대한 비판, 불만, 짧은 감상, 질문처럼 평범한 의견은 애매하더라도 allow로 판단하세요.
- 판단이 애매하면 과도하게 막지 말고 allow를 선택하세요. 이 검토는 명백한 스팸·공격만 걸러내는 보조 장치입니다.`;

/**
 * 댓글 본문을 Claude에게 보내 스팸·욕설 여부만 가볍게 확인합니다.
 * API 키가 없거나 호출이 실패하면 댓글 기능 자체를 막지 않고 통과시킵니다(fail-open) —
 * 모더레이션은 보조 안전장치이고, 일시적인 AI 호출 실패로 정상적인 댓글까지 막으면 안 되기 때문입니다.
 */
export async function moderateComment(body: string): Promise<CommentModerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { blocked: false };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      tools: [moderationTool],
      tool_choice: { type: "tool", name: "emit_moderation" },
      messages: [
        {
          role: "user",
          content: `아래 댓글을 검토하고 emit_moderation 도구로 판단을 반환하세요.\n\n<comment>\n${body}\n</comment>`,
        },
      ],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (!toolUse) return { blocked: false };

    const input = toolUse.input as { verdict?: unknown; reason?: unknown };
    if (input.verdict !== "reject") return { blocked: false };

    const reason =
      typeof input.reason === "string" && input.reason.trim()
        ? input.reason.trim()
        : "운영 정책에 맞지 않는 내용이 포함되어 있어 등록할 수 없습니다.";
    return { blocked: true, reason };
  } catch (error) {
    console.error("댓글 AI 검토 실패 (fail-open으로 등록 계속):", error);
    return { blocked: false };
  }
}
