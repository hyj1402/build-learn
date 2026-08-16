import type { Metadata } from "next";
export const metadata: Metadata = { title: "About" };
const stacks = [
  { title: "Main", items: ["Java", "Spring", "PostgreSQL"] },
  { title: "Working With", items: ["Next.js", "TypeScript", "React"] },
  { title: "Exploring", items: ["AI-assisted development", "MDX", "Web performance"] },
];
export default function AboutPage() {
  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">ABOUT</p>
        <h1>
          배운 것을
          <br />
          다시 만드는 개발자.
        </h1>
        <p>기술을 소비하는 데서 멈추지 않고 직접 만들고 기록하며 이해의 깊이를 넓혀갑니다.</p>
      </header>
      <section className="section about-section">
        <p className="eyebrow">CAREER</p>
        <h2>
          문제를 오래 다루는 힘을
          <br />
          제품으로 연결합니다.
        </h2>
        <p className="muted">상세 경력은 실제 이력 정보가 정리된 뒤 업데이트합니다.</p>
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
          <p className="muted">Next.js App Router와 파일 기반 콘텐츠 구조를 학습하고 있습니다.</p>
        </div>
        <div>
          <p className="eyebrow">INTERESTS</p>
          <h2>오래 보고 싶은 것</h2>
          <p className="muted">
            유지보수하기 쉬운 구조, 개발 경험, 레거시 현대화에 관심이 있습니다.
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
      </section>
    </div>
  );
}
