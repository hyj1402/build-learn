"use client";

// 입력값 상태와 브라우저 주소 이동을 사용하므로 이 파일은 Client Component입니다.

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

  /** 검색 제출 시 다른 필터는 유지하고 q 값만 추가하거나 제거합니다. */
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // 현재 쿼리스트링을 복사해야 category와 tag가 검색 후에도 사라지지 않습니다.
    const next = new URLSearchParams(searchParams.toString());
    const value = query.trim();
    if (value) next.set("q", value);
    else next.delete("q");
    // 새 주소로 이동하면 URL 공유와 브라우저 앞·뒤 이동에도 같은 검색 상태가 유지됩니다.
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
