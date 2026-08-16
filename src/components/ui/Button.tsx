import Link from "next/link";
export function Button({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="text-link" href={href}>
      {children}
    </Link>
  );
}
