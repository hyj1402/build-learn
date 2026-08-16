import Link from "next/link";

// 메뉴를 데이터로 분리하면 링크를 추가할 때 JSX를 복사하지 않아도 됩니다.
const links = [
  ["Projects", "/projects"],
  ["Log", "/log"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

/** 모든 페이지 위쪽에 공통으로 표시되는 로고와 주요 메뉴입니다. */
export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="logo" href="/">
          BUILD & LEARN.
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
