import Link from "next/link";
import { LogCard } from "@/components/log/LogCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getLogs } from "@/lib/logs";
import { getProjects } from "@/lib/projects";

/** Home은 데이터 함수가 이미 정렬한 공개 콘텐츠 중 대표 프로젝트와 최신 Log 세 개만 보여줍니다. */
export default function Home() {
  const projects = getProjects({ featured: true }).slice(0, 3);
  const logs = getLogs().slice(0, 3);
  return (
    <>
      <section className="hero container">
        <p className="eyebrow">PERSONAL DEVELOPMENT ARCHIVE</p>
        <h1>
          만들고 배우고,
          <br />그 과정을 기록합니다.
        </h1>
        <p className="hero-copy">
          완성한 결과뿐 아니라 그 과정에서 내린 결정과 배운 내용을 오래 남깁니다.
        </p>
        <Link className="text-link" href="/projects">
          프로젝트 살펴보기 →
        </Link>
      </section>
      <section className="section container">
        <SectionHeading eyebrow="SELECTED WORK" title="Featured Projects" href="/projects" />
        <div className="card-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} priority={index < 3} />
          ))}
        </div>
      </section>
      <section className="section container">
        <SectionHeading eyebrow="LATEST NOTES" title="Recent Logs" href="/log" />
        <div className="log-list">
          {logs.map((log, index) => (
            <LogCard key={log.slug} log={log} priority={index === 0} />
          ))}
        </div>
      </section>
    </>
  );
}
