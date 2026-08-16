"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SearchInput({
  defaultValue = "",
  label,
}: {
  defaultValue?: string;
  label: string;
}) {
  const [query, setQuery] = useState(defaultValue);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    const value = query.trim();
    if (value) next.set("q", value);
    else next.delete("q");
    router.push(`${pathname}${next.size ? `?${next.toString()}` : ""}`);
  }

  return (
    <form className="search-form" onSubmit={submit} role="search">
      <label className="sr-only" htmlFor={`${pathname}-search`}>
        {label}
      </label>
      <input
        id={`${pathname}-search`}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={label}
      />
      <button type="submit">검색</button>
    </form>
  );
}
