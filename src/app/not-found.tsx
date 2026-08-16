import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container not-found">
      <p className="eyebrow">ERROR / 404</p>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p>주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.</p>
      <Link className="project-action" href="/">
        Home으로 돌아가기 →
      </Link>
    </section>
  );
}
