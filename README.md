# BUILD & LEARN

만들고 배우고, 그 과정을 기록하는 개인 개발 아카이브입니다.

## 실행

```bash
npm install
npm run dev
```

로컬 주소는 `http://localhost:3000`입니다.

## 검증

```bash
npm run lint
npm run type-check
npm run build
```

## 콘텐츠 작성

- 프로젝트: `src/content/projects/*.mdx`
- 로그: `src/content/logs/*.mdx`
- 프로젝트와 로그의 메타데이터는 각 MDX 파일의 frontmatter에 작성합니다.
- `isPublished: true`인 콘텐츠만 목록과 상세 페이지에 노출됩니다.
- 프로젝트 데모는 `demoType: embed | link | download`와 `demoUrl` 또는 `downloadUrl`을 사용합니다.

## MVP 원칙

- 콘텐츠는 MDX 파일로 관리합니다.
- DB, Prisma, 회원가입, 로그인, Admin은 사용하지 않습니다.
- 카테고리와 태그 필터는 URL 쿼리스트링으로 관리합니다.
- 다크모드, 다국어, 통계는 현재 범위에 포함하지 않습니다.
