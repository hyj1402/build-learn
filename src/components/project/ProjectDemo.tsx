import type { Project } from "@/types/project";

/** 프로젝트의 demoType에 따라 임베드, 다운로드, 외부 링크 중 하나를 보여줍니다. */
export function ProjectDemo({ project }: { project: Project }) {
  // embed는 현재 페이지 안에서 다른 웹 데모를 iframe으로 보여주는 방식입니다.
  if (project.demoType === "embed" && project.demoUrl) {
    return (
      <section className="project-demo" aria-labelledby="project-demo-title">
        <h2 id="project-demo-title">Live Demo</h2>
        <iframe
          src={project.demoUrl}
          title={`${project.title} 데모`}
          loading="lazy"
          // iframe이 필요한 기능만 허용해 외부 페이지의 권한 범위를 제한합니다.
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </section>
    );
  }

  // download 속성이 있으면 링크를 여는 대신 파일 저장을 요청합니다.
  if (project.demoType === "download" && project.downloadUrl) {
    return (
      <a className="project-action" href={project.downloadUrl} download>
        결과물 다운로드 ↓
      </a>
    );
  }

  // 외부 데모는 새 탭으로 열고 noreferrer로 현재 페이지 정보를 전달하지 않습니다.
  if (project.demoType === "link" && project.demoUrl) {
    return (
      <a className="project-action" href={project.demoUrl} target="_blank" rel="noreferrer">
        데모 열기 ↗
      </a>
    );
  }

  // 데모 정보가 없거나 필요한 URL이 빠졌다면 빈 UI를 안전하게 반환합니다.
  return null;
}
