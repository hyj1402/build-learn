export type SearchParamValue = string | undefined;

/**
 * 현재 URL 조건과 새 변경값을 합쳐 필터 링크를 만듭니다.
 * 값이 undefined인 조건은 URL에서 제거되므로 카테고리·태그·검색어를 안전하게 조합할 수 있습니다.
 */
export function createSearchHref(
  pathname: string,
  current: Record<string, SearchParamValue>,
  changes: Record<string, SearchParamValue>,
) {
  const params = new URLSearchParams();

  // changes를 나중에 펼쳐 같은 키가 있으면 새 값이 현재 값을 덮어쓰게 합니다.
  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
