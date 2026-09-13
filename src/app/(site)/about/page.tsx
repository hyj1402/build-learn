import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProjects } from "@/lib/projects-db";

export const metadata: Metadata = { title: "About" };

// 반복되는 기술 스택 카드를 데이터로 분리해 항목 추가와 순서 변경을 쉽게 합니다.
const stacks = [
  { title: "Main", items: ["Java", "Spring", "MyBatis", "Oracle / MySQL"] },
  { title: "Working With", items: ["Next.js", "TypeScript", "React", "Supabase"] },
  { title: "Exploring", items: ["AI-assisted development", "Web performance", "PostgreSQL"] },
];

/**
 * About 페이지는 실제 이력 정보가 없는 문구 대신, DB에 등록된 실제 프로젝트 데이터로
 * 경력 타임라인을 만듭니다. Server Component라서 이 함수 자체가 요청마다 서버에서
 * getPublishedProjects()를 호출해 최신 데이터를 그때그때 반영합니다.
 */
export default async function AboutPage() {
  const projects = await getPublishedProjects();

  // period.start가 "YYYY.MM" 형식이라 문자열 비교만으로도 최신순 정렬이 됩니다.
  const timeline = [...projects].sort((a, b) => b.period.start.localeCompare(a.period.start));
  const earliestYear = timeline.at(-1)?.period.start.slice(0, 4);
  const isCurrentlyActive = timeline.some((project) => project.status === "in-progress");

  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">ABOUT</p>
        <h1>
          배운 것을
          <br />
          다시 만드는 개발자.
        </h1>
        <p>
          {earliestYear ?? "여러 해"}년부터 금융·공공·통신 분야의 Java 기반 업무 시스템을
          개발해왔습니다. 이제 그 경험을 바탕으로 프런트엔드와 AI 활용 개발까지 직접 만들고
          기록합니다.
        </p>
      </header>
      <section className="section about-section">
        <p className="eyebrow">CAREER</p>
        <h2>
          문제를 오래 다루는 힘을
          <br />
          제품으로 연결합니다.
        </h2>
        <p className="muted">
          {timeline.length}개 프로젝트 · {earliestYear ?? "-"} —{" "}
          {isCurrentlyActive ? "현재" : "완료"}. 아래 목록은 <Link href="/projects">Projects</Link>
          에 등록된 실제 이력입니다.
        </p>
        <ol className="career-timeline">
          {timeline.map((project) => (
            <li key={project.slug} className="career-item">
              <span className="career-period">
                {project.period.start}
                {project.period.end ? ` – ${project.period.end}` : " – 진행 중"}
              </span>
              <div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <ul className="career-tech">
                  {project.techStack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="section">
        <p className="eyebrow">TECH STACK</p>
        <div className="stack-grid">
          {stacks.map((stack) => (
            <div key={stack.title}>
              <h2>{stack.title}</h2>
              <ul>
                {stack.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="section split-section">
        <div>
          <p className="eyebrow">CURRENTLY</p>
          <h2>지금 배우는 것</h2>
          <p className="muted">
            이 사이트 자체를 Next.js App Router와 Supabase(Postgres)로 직접 만들면서, 익숙한 백엔드
            사고방식을 프런트엔드·DB 설계에 어떻게 적용할지 배우고 있습니다.
          </p>
        </div>
        <div>
          <p className="eyebrow">INTERESTS</p>
          <h2>오래 보고 싶은 것</h2>
          <p className="muted">
            엔터프라이즈 시스템에서 익힌 유지보수 가능한 구조를, 혼자 만드는 개인 프로젝트에도 같은
            기준으로 이어가는 것에 관심이 있습니다.
          </p>
        </div>
      </section>
      <section className="section about-section">
        <p className="eyebrow">DEVELOPMENT PHILOSOPHY</p>
        <h2>
          이해하지 못한 추상화보다
          <br />
          설명할 수 있는 단순함을 선택합니다.
        </h2>
        <div className="about-links">
          <a href="mailto:tkznfk1402@gmail.com">Email</a>
          <a href="https://github.com/hyj1402/build-learn" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <Link href="/projects">Projects 보기</Link>
          <Link href="/contact">Contact로 이동</Link>
        </div>
      </section>
    </div>
  );
}
