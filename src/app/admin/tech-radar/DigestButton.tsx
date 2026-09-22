"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TECH_ARTICLE_TOPICS, type TechArticleTopic } from "@/lib/tech-radar/topics";
import { generateDailyDigest } from "./actions";

/**
 * 선택한 분류의 "새 글"들을 Claude로 요약해 Log 임시저장 글을 만들고, 바로 그 초안 수정 화면으로 이동합니다.
 * 기본값은 개발·AI 기술이며, 날짜를 비워두면 아직 처리 안 한 글 전부를 대상으로 합니다.
 * 여기서 자동으로 공개 발행하지 않고 반드시 관리자가 내용을 확인한 뒤 직접 발행 버튼을 누르게 합니다.
 */
export function DigestButton() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [topics, setTopics] = useState<TechArticleTopic[]>(["ai_development"]);
  const router = useRouter();

  /** 체크한 분류만 서버에 전달해, 원치 않는 제품·회사 소식이 기본 다이제스트에 섞이지 않게 합니다. */
  function toggleTopic(topic: TechArticleTopic) {
    setTopics((current) =>
      current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic],
    );
  }

  function run() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const { logId } = await generateDailyDigest({
          start: startDate || undefined,
          end: endDate || undefined,
          topics,
        });
        router.push(`/admin/logs/${logId}/edit`);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "다이제스트를 만들지 못했습니다.");
      }
    });
  }

  return (
    <div>
      <div className="admin-form-row" style={{ maxWidth: 420, marginBottom: "var(--space-2)" }}>
        <div className="admin-field">
          <label htmlFor="digest-start-date">시작일 (선택)</label>
          <input
            id="digest-start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="digest-end-date">종료일 (선택)</label>
          <input
            id="digest-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </div>
      <p style={{ margin: "0 0 var(--space-2)", color: "var(--muted)", fontSize: 13 }}>
        기본으로 개발·AI 기술만 선택됩니다. 제품·회사 소식은 필요할 때만 함께 선택하세요.
      </p>
      <fieldset className="admin-topic-options">
        <legend>다이제스트에 포함할 분류</legend>
        {Object.entries(TECH_ARTICLE_TOPICS).map(([topic, label]) => (
          <label key={topic}>
            <input
              checked={topics.includes(topic as TechArticleTopic)}
              type="checkbox"
              onChange={() => toggleTopic(topic as TechArticleTopic)}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        className="admin-action-button admin-action-violet"
        disabled={isPending}
        onClick={run}
      >
        {isPending
          ? "AI가 요약하는 중..."
          : startDate || endDate
            ? "선택한 기간으로 다이제스트 만들기"
            : "오늘의 다이제스트 만들기"}
      </button>
      {errorMessage && <p className="admin-error-message">{errorMessage}</p>}
    </div>
  );
}
