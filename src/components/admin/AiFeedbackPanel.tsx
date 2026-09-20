"use client";

import { useState, useTransition } from "react";
import { requestWritingFeedback, type AiFeedbackState } from "@/app/admin/ai-feedback-actions";

/**
 * 편집기 아래에서 글 초안에 대한 AI 피드백을 받는 관리자 전용 패널입니다.
 * 결과는 참고용으로만 보여주고 본문은 절대 자동으로 바꾸지 않습니다 — 반영 여부는 글쓴이가 정합니다.
 * 제목은 편집기가 알 수 없어서, 같은 <form> 안의 title 입력값을 요청 시점에 읽어옵니다.
 */
export function AiFeedbackPanel({
  getMarkdown,
  kind,
}: {
  getMarkdown: () => string;
  kind: "log" | "project";
}) {
  const [state, setState] = useState<AiFeedbackState | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRequest(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.closest("form");
    const title = form ? String(new FormData(form).get("title") ?? "") : "";
    const markdown = getMarkdown();
    startTransition(async () => {
      setState(await requestWritingFeedback(title, markdown, kind));
    });
  }

  return (
    <section className="ai-feedback" aria-labelledby="ai-feedback-heading">
      <div className="ai-feedback-head">
        <div>
          <h3 id="ai-feedback-heading">AI 글쓰기 피드백</h3>
          <p>초안을 Claude가 읽고 총평·개선점·다음 단계를 제안합니다. 본문은 바뀌지 않아요.</p>
        </div>
        <button
          type="button"
          className="admin-action-button admin-action-outline-blue"
          onClick={handleRequest}
          disabled={isPending}
        >
          {isPending ? "읽는 중..." : state ? "다시 받기" : "피드백 받기"}
        </button>
      </div>

      {state?.status === "error" && (
        <p className="login-message login-message-error" role="alert">
          {state.message}
        </p>
      )}

      {state?.status === "ok" && (
        <div className="ai-feedback-body" aria-live="polite">
          <p className="ai-feedback-summary">{state.feedback.summary}</p>

          <h4>잘 쓴 점</h4>
          <ul>
            {state.feedback.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h4>고치면 좋은 점</h4>
          <ul>
            {state.feedback.improvements.map((item) => (
              <li key={item.issue}>
                <strong>{item.issue}</strong>
                <span>{item.suggestion}</span>
              </li>
            ))}
          </ul>

          {state.feedback.missingPerspectives.length > 0 && (
            <>
              <h4>빠져 있는 관점</h4>
              <ul>
                {state.feedback.missingPerspectives.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}

          <h4>다음 단계 제안</h4>
          <ul>
            {state.feedback.nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="ai-feedback-note">AI의 제안일 뿐이라 틀릴 수 있습니다. 참고만 하세요.</p>
        </div>
      )}
    </section>
  );
}
