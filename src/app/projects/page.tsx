import type { Metadata } from "next";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectFilterBar } from "@/components/project/ProjectFilterBar";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { getProjects } from "@/lib/projects";
import type { ProjectCategory } from "@/types/project";
export const metadata: Metadata = { title: "Projects", description: "만들면서 배운 프로젝트 기록" };
export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const values = await searchParams;
  const category =
    typeof values.category === "string" &&
    PROJECT_CATEGORIES.includes(values.category as ProjectCategory)
      ? (values.category as ProjectCategory)
      : undefined;
  const query = typeof values.q === "string" ? values.q : undefined;
  const projects = getProjects({ category, query });
  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">WORK / PROJECTS</p>
        <h1>Projects</h1>
        <p>결과물과 함께 문제, 선택, 시행착오와 배움을 기록합니다.</p>
      </header>
      <ProjectFilterBar activeCategory={category} query={query} />
      {projects.length > 0 ? (
        <div className="card-grid">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              priority={index < 3}
              headingLevel="h2"
            />
          ))}
        </div>
      ) : (
        <p className="empty-state" role="status">
          조건에 맞는 프로젝트가 없습니다.
        </p>
      )}
    </div>
  );
}
