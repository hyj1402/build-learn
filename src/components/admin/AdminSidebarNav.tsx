"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 현재 보고 있는 메뉴를 표시하려면 주소를 알아야 하는데, usePathname은 브라우저에서 동작하는 훅이라
// 이 부분만 Client Component로 분리했습니다. 레이아웃의 나머지(권한 확인 등)는 서버에 그대로 둡니다.

type NavItem = { href: string; label: string; badge?: number };
type NavGroup = { title: string; items: NavItem[] };

export function AdminSidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  /** /admin/logs/new 처럼 하위 주소에 있어도 상위 메뉴가 선택된 것으로 표시합니다. */
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="admin-side-nav" aria-label="관리자 메뉴">
      {groups.map((group) => (
        <div key={group.title} className="admin-side-group">
          <p className="admin-side-title">{group.title}</p>
          <ul>
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive(item.href) ? "is-active" : undefined}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  {item.badge ? <em className="admin-side-badge">{item.badge}</em> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
