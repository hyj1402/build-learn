// 코드 수정 없이 로컬·Vercel·사용자 도메인에서 같은 metadata 코드를 쓰기 위한 우선순위입니다.
const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

// 끝의 슬래시를 제거해 `${SITE_URL}/projects` 조합에서 슬래시가 두 번 생기지 않게 합니다.
export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");
