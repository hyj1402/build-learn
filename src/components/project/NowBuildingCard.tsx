import Link from "next/link";
import type { Project } from "@/types/project";

const statusLabel = {
  completed: "COMPLETED",
  "in-progress": "IN PROGRESS",
  archived: "ARCHIVED",
} as const;

/**
 * Home Hero에서 지금 진행 중인 대표 프로젝트를 짧게 소개하는 링크 카드입니다.
 * 이미지가 없어도 프로젝트의 실제 제목·요약·기술 스택을 작은 화면 모형으로 보여 주며,
 * 클릭하면 일반 Project 상세 화면으로 이동합니다.
 */
export function NowBuildingCard({ project }: { project: Project }) {
  return (
    <Link className="hero-now-card" href={`/projects/${project.slug}`}>
      <span className="hero-now-card-top">
        <span className="hero-now-label">
          <span aria-hidden="true" className="hero-now-dot" />
          NOW BUILDING
        </span>
        <span>{statusLabel[project.status]}</span>
      </span>

      {/* 실제 서비스 화면을 복제하지 않은, Home Hero 전용의 가벼운 프로젝트 미리보기입니다. */}
      <span aria-hidden="true" className="hero-now-preview">
        <span className="hero-now-preview-bar">
          <i />
          <i />
          <i />
        </span>
        <span className="hero-now-preview-body">
          <span className="hero-now-preview-nav" />
          <span className="hero-now-preview-content">
            <i className="hero-now-preview-kicker" />
            <i className="hero-now-preview-title" />
            <i className="hero-now-preview-title hero-now-preview-title-short" />
            <i className="hero-now-preview-copy" />
            <i className="hero-now-preview-copy hero-now-preview-copy-short" />
            <i className="hero-now-preview-button" />
          </span>
        </span>
      </span>

      <span className="hero-now-copy">
        <span className="hero-now-type">
          PERSONAL PROJECT / {project.period.start || "ONGOING"}
        </span>
        <strong>{project.title}</strong>
        <span>{project.summary}</span>
      </span>

      <span className="hero-now-card-bottom">
        <span className="hero-now-tags">
          {project.techStack.slice(0, 3).map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </span>
        <span aria-hidden="true">↗</span>
      </span>
    </Link>
  );
}
