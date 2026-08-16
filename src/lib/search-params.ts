export type SearchParamValue = string | undefined;

export function createSearchHref(
  pathname: string,
  current: Record<string, SearchParamValue>,
  changes: Record<string, SearchParamValue>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
