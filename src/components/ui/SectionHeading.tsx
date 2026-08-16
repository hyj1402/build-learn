import Link from "next/link";

/** Home 섹션의 작은 영문 라벨, 제목, 선택적 전체 보기 링크를 같은 구조로 유지합니다. */
export function SectionHeading({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          전체 보기 →
        </Link>
      )}
    </div>
  );
}
