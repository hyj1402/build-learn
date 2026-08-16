import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types/project";

export function ProjectCard({
  project,
  priority = false,
  headingLevel = "h3",
}: {
  project: Project;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <Link className="project-card" href={`/projects/${project.slug}`}>
      <div className="project-image">
        <Image
          src={project.thumbnailImage}
          alt={`${project.title} 대표 이미지`}
          fill
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
