import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types/project";

/** 목록과 Home에서 재사용하는 프로젝트 요약 카드입니다. */
export function ProjectCard({
  project,
  priority = false,
  headingLevel = "h3",
}: {
  project: Project;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  // 페이지의 제목 순서를 지키기 위해 목록에서는 h2, Home 카드에서는 h3를 선택합니다.
  const Heading = headingLevel;

  return (
    <Link className="project-card" href={`/projects/${project.slug}`}>
      <div className="project-image">
        <Image
          src={project.thumbnailImage}
          alt={`${project.title} 대표 이미지`}
          fill
          // 첫 화면에 보이는 카드만 즉시 로드하고 나머지는 스크롤 근처에서 불러옵니다.
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 800px) 100vw, 33vw"
        />
      </div>
      <div className="project-card-copy">
        <div className="card-meta">
          <Badge>{project.category}</Badge>
          <Badge variant="tag">{project.status}</Badge>
        </div>
        <Heading>{project.title}</Heading>
        <p>{project.summary}</p>
        <div className="tag-row">
          {/* 카드가 너무 길어지지 않도록 대표 기술 세 개만 표시합니다. */}
          {project.techStack.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="tag">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
