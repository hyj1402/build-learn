import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Next.js의 성능·접근성 권장 규칙과 TypeScript 규칙을 함께 사용합니다.
  ...nextVitals,
  ...nextTs,
  // 빌드 결과물처럼 직접 관리하지 않는 파일은 검사 대상에서 제외합니다.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
