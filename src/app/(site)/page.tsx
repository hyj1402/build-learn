import Link from "next/link";
import { LogCard } from "@/components/log/LogCard";
import { NowBuildingCard } from "@/components/project/NowBuildingCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedLogs } from "@/lib/logs-db";
import { getPublishedProjects } from "@/lib/projects-db";

/**
 * Home은 서버에서 공개 Project·Log를 한 번씩 읽어 Hero와 목록에 함께 사용합니다.
 * 브라우저에서 추가 요청하지 않으므로 첫 화면의 소개 정보와 카드가 같은 데이터 기준을 유지합니다.
 */
export default async function Home() {
  const [publishedProjects, publishedLogs] = await Promise.all([
    getPublishedProjects(),
    getPublishedLogs(),
  ]);
  const projects = publishedProjects.filter((project) => project.isFeatured).slice(0, 3);
  const logs = publishedLogs.slice(0, 3);
  // 이 사이트 자체를 가장 먼저 보여 주고, 아직 등록되지 않았다면 진행 중인 프로젝트를 대신 사용합니다.
  const nowBuilding =
    publishedProjects.find((project) => project.slug === "build-learn") ??
    publishedProjects.find((project) => project.status === "in-progress") ??
    projects[0];

  return (
    <>
      <section className="hero container">
        <div className="hero-grid">
          <div className="hero-main">
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
          </div>
          {nowBuilding ? <NowBuildingCard project={nowBuilding} /> : null}
        </div>

        <ul aria-label="아카이브 현황" className="hero-status">
          <li>
            <span>ARCHIVE STATUS</span>
            <strong>LIVE</strong>
          </li>
          <li>
            <span>PUBLIC PROJECTS</span>
            <strong>{String(publishedProjects.length).padStart(2, "0")}</strong>
          </li>
          <li>
            <span>PUBLIC LOGS</span>
            <strong>{String(publishedLogs.length).padStart(2, "0")}</strong>
          </li>
        </ul>
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
