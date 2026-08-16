import Link from "next/link";

/** 버튼처럼 강조된 내부 이동 링크입니다. Next.js Link라 페이지 전체를 새로고침하지 않습니다. */
export function Button({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="text-link" href={href}>
      {children}
    </Link>
  );
}
