"use client";

import { useTransition } from "react";
import { TECH_ARTICLE_TOPICS, type TechArticleTopic } from "@/lib/tech-radar/topics";
import { updateArticleTopic } from "./actions";

/** 자동 분류가 틀렸을 때 목록에서 바로 고칠 수 있는 한 건짜리 분류 선택기입니다. */
export function TopicSelect({ articleId, topic }: { articleId: string; topic: TechArticleTopic }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      aria-label="글 분류"
      className="admin-topic-select"
      defaultValue={topic}
      disabled={isPending}
      onChange={(event) => startTransition(() => updateArticleTopic(articleId, event.target.value))}
    >
      {Object.entries(TECH_ARTICLE_TOPICS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
