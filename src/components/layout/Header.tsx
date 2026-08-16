import Link from "next/link";
const links = [
  ["Projects", "/projects"],
  ["Log", "/log"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;
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
