import type { Project } from "@/types/project";

export function ProjectDemo({ project }: { project: Project }) {
  if (project.demoType === "embed" && project.demoUrl) {
    return (
      <section className="project-demo" aria-labelledby="project-demo-title">
        <h2 id="project-demo-title">Live Demo</h2>
        <iframe
          src={project.demoUrl}
          title={`${project.title} 데모`}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </section>
    );
  }

  if (project.demoType === "download" && project.downloadUrl) {
    return (
      <a className="project-action" href={project.downloadUrl} download>
        결과물 다운로드 ↓
      </a>
    );
  }

  if (project.demoType === "link" && project.demoUrl) {
    return (
      <a className="project-action" href={project.demoUrl} target="_blank" rel="noreferrer">
        데모 열기 ↗
      </a>
    );
  }

  return null;
}
