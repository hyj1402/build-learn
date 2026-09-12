"use client";

import Link from "next/link";
import { startTransition } from "react";
import { markArticleDrafted } from "./actions";

/**
 * "학습 기록 초안 만들기"는 실제 저장 없이 새 글 작성 화면으로 값만 넘기는 이동이라 Link로 처리하고,
 * 동시에 이 글을 참고했다는 상태만 조용히 기록합니다(이동 자체는 막지 않습니다).
 */
export function DraftLink({ articleId, href }: { articleId: string; href: string }) {
  return (
    <Link
      href={href}
      className="admin-action-button admin-action-outline-blue"
      onClick={() => startTransition(() => markArticleDrafted(articleId))}
    >
      초안 만들기
    </Link>
  );
}
