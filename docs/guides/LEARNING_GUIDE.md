# BUILD & LEARN 초보자 학습 가이드

이 문서는 현재 프로젝트에 구현된 코드를 처음부터 이해하기 위한 학습 자료입니다.

Next.js를 처음 접했다면 모든 코드를 한 번에 이해하려고 하지 말고 다음 순서대로 읽어보세요.

1. 프로젝트 실행 방법
2. 폴더가 담당하는 역할
3. 사용자가 페이지를 열었을 때 일어나는 일
4. MDX 콘텐츠를 화면에 표시하는 과정
5. 카테고리·태그·검색 필터의 동작
6. Server Component와 Client Component의 차이
7. 직접 해보는 작은 실습

---

## 1. 이 프로젝트는 무엇인가요?

BUILD & LEARN은 프로젝트와 개발 기록을 저장하는 개인 개발 아카이브입니다.

> **2026-09-13 갱신:** 이 섹션은 최초 MVP(파일 기반) 당시 기록입니다. 지금은 Supabase DB·로그인·관리자 화면·Log 댓글까지 추가된 상태입니다. 최신 요청 처리 흐름은 **부록 D**를 먼저 읽어보세요.

처음 만들 때는 일반적인 게시판처럼 데이터베이스에서 글을 가져오는 대신, `.mdx` 파일을 글 저장소로 사용했습니다.

```text
MDX 파일 작성
    ↓
Next.js 서버가 파일 읽기
    ↓
카테고리·검색어에 맞게 필터링
    ↓
React 컴포넌트로 화면 생성
    ↓
브라우저에 HTML 전달
```

최초 MVP에는 다음 기능을 넣지 않았습니다.

- ~~회원가입과 로그인~~ → Supabase Auth(Google, 이메일)로 추가됨
- ~~데이터베이스~~ → Supabase(Postgres)로 추가됨. Project·Log는 이제 DB에서 조회하고, 기존 MDX 파일은 백업으로만 보존
- ~~관리자 페이지~~ → `/admin`으로 추가됨 (콘텐츠 작성·문의 확인·Tech Radar 등)
- 다크모드와 다국어: 아직 없음
- 방문자 통계: 아직 없음

당시엔 필요하지 않은 기능을 미리 만들지 않고, 콘텐츠를 보여주는 핵심 기능부터 완성하는 순서를 택했습니다.

---

## 2. 프로젝트 실행 방법

터미널에서 프로젝트 폴더로 이동합니다.

```powershell
cd C:\homeProject\build-learn
```

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 다음 주소를 엽니다.

```text
http://localhost:3000
```

서버를 종료하려면 서버를 실행한 터미널에서 `Ctrl + C`를 누릅니다.

### 자주 사용하는 명령어

```bash
# 개발 서버 실행
npm run dev

# 잘못된 코드 스타일이나 규칙 검사
npm run lint

# TypeScript 타입 검사
npm run type-check

# 코드 자동 정렬
npm run format

# 코드 정렬 상태만 검사
npm run format:check

# 실제 배포용 빌드가 가능한지 검사
npm run build
```

코드를 수정한 뒤에는 최소한 다음 세 명령을 실행하는 습관을 들이는 것이 좋습니다.

```bash
npm run lint
npm run type-check
npm run build
```

---

## 3. 주요 폴더 구조

```text
build-n-learn/
├── public/                     브라우저에 그대로 제공할 이미지
├── src/
│   ├── app/                    URL과 페이지
│   ├── components/             화면을 구성하는 재사용 부품
│   ├── content/                프로젝트와 로그 MDX 파일
│   ├── lib/                    데이터 읽기·필터링 등의 로직
│   ├── styles/                 전체 디자인 CSS
│   └── types/                  데이터의 TypeScript 타입
├── package.json                패키지와 실행 명령
└── README.md                   프로젝트 사용 요약
```

각 폴더를 식당에 비유하면 다음과 같습니다.

| 폴더         | 역할                        | 식당 비유          |
| ------------ | --------------------------- | ------------------ |
| `app`        | 주소에 맞는 페이지 선택     | 손님이 앉는 테이블 |
| `components` | 카드, Header 같은 화면 부품 | 접시와 식기        |
| `content`    | 실제 프로젝트와 글          | 식재료             |
| `lib`        | 파일 읽기와 필터링          | 조리 과정          |
| `types`      | 데이터가 지켜야 할 모양     | 레시피 규칙        |
| `styles`     | 색상, 크기, 배치            | 플레이팅 방식      |

---

## 4. `src/app`과 URL의 관계

Next.js App Router는 폴더 구조를 URL로 사용합니다.

```text
src/app/page.tsx                    → /
src/app/projects/page.tsx           → /projects
src/app/projects/[slug]/page.tsx    → /projects/임의의-slug
src/app/log/page.tsx                → /log
src/app/log/[slug]/page.tsx         → /log/임의의-slug
src/app/about/page.tsx              → /about
src/app/contact/page.tsx            → /contact
```

### `page.tsx`란?

해당 주소에서 보여줄 화면입니다.

예를 들어 사용자가 `/about`을 열면 Next.js는 `src/app/about/page.tsx`를 실행합니다.

### `[slug]`란?

대괄호로 감싼 폴더는 값이 바뀔 수 있는 동적 경로입니다.

```text
/projects/build-and-learn
          └─ slug = "build-and-learn"

/projects/ui-experiment
          └─ slug = "ui-experiment"
```

Next.js 16에서는 `params`가 Promise이기 때문에 `await`으로 읽습니다.

```tsx
export default async function ProjectDetail({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
}
```

### `layout.tsx`란?

모든 페이지를 공통으로 감싸는 파일입니다.

현재 `src/app/layout.tsx`에서 다음 공통 UI를 출력합니다.

```text
Header
  ↓
현재 페이지
  ↓
Footer
```

따라서 각 페이지에서 Header와 Footer를 반복해서 작성할 필요가 없습니다.

---

## 5. Component란 무엇인가요?

Component는 화면을 구성하는 재사용 가능한 작은 부품입니다.

예를 들어 프로젝트 카드의 코드를 모든 페이지에 복사하면 수정할 때마다 여러 파일을 고쳐야 합니다. 대신 `ProjectCard`를 한 번 만들고 필요한 페이지에서 가져와 사용합니다.

```tsx
<ProjectCard project={project} />
```

현재 주요 Component는 다음과 같습니다.

```text
components/
├── layout/
│   ├── Header.tsx
│   └── Footer.tsx
├── project/
│   ├── ProjectCard.tsx
│   ├── ProjectFilterBar.tsx
│   └── ProjectDemo.tsx
├── log/
│   ├── LogCard.tsx
│   └── LogFilterBar.tsx
├── search/
│   └── SearchInput.tsx
├── contact/
│   └── ContactForm.tsx
└── ui/
    ├── Badge.tsx
    ├── Button.tsx
    └── SectionHeading.tsx
```

### Props란?

부모 Component가 자식 Component에 전달하는 값입니다.

```tsx
<Badge variant="tag">Next.js</Badge>
```

위 코드에서는 다음 두 값을 `Badge`에 전달합니다.

- `variant="tag"`
- `children="Next.js"`

TypeScript는 Props에 엉뚱한 값이 들어가지 않도록 검사합니다.

---

## 6. TypeScript 타입은 왜 필요한가요?

`src/types/project.ts`는 프로젝트 데이터가 가져야 하는 필드를 정의합니다.

중요한 필드를 간단히 표현하면 다음과 같습니다.

```ts
type Project = {
  slug: string;
  title: string;
  category: "web" | "app" | "game" | "experiment";
  techStack: string[];
  isPublished: boolean;
};
```

다음 코드는 허용됩니다.

```ts
category: "web";
```

다음 코드는 정해진 카테고리가 아니므로 TypeScript 검사에서 문제가 됩니다.

```ts
category: "website";
```

### 프로젝트 데모 타입

프로젝트마다 결과물을 보여주는 방식이 다를 수 있습니다.

```ts
type ProjectDemoType = "embed" | "link" | "download";
```

| 값         | 의미                  | 함께 사용하는 필드 |
| ---------- | --------------------- | ------------------ |
| `embed`    | 페이지 안에 데모 삽입 | `demoUrl`          |
| `link`     | 외부 데모 페이지 열기 | `demoUrl`          |
| `download` | 결과물 다운로드       | `downloadUrl`      |

`ProjectDemo.tsx`가 이 값을 확인해 알맞은 UI를 선택합니다.

---

## 7. MDX란 무엇인가요?

MDX는 Markdown에 JSX 기능을 더한 파일 형식입니다.

현재 프로젝트에서는 프로젝트와 로그를 `.mdx` 파일로 저장합니다.

```text
src/content/projects/*.mdx
src/content/logs/*.mdx
```

### Frontmatter

MDX 파일 위쪽의 `---` 사이 영역을 frontmatter라고 합니다.

```mdx
---
title: "BUILD & LEARN"
category: "web"
techStack: ["Next.js", "TypeScript", "MDX"]
isPublished: true
createdAt: "2026-08-16"
---

## Overview

여기부터 실제 본문입니다.
```

frontmatter는 카드, 목록, 검색, Metadata 등에 사용하는 구조화된 정보입니다.

`---` 아래쪽은 상세 페이지에 보여줄 본문입니다.

### 공개와 프로젝트 상태는 다릅니다

```yaml
status: "in-progress"
isPublished: true
```

- `status`: 프로젝트가 진행 중인지, 완료됐는지 나타냅니다.
- `isPublished`: 사이트에 공개할지를 나타냅니다.

진행 중인 프로젝트를 공개할 수도 있으므로 두 값은 분리되어 있습니다.

---

## 8. MDX 파일이 화면이 되는 과정

프로젝트 목록이 만들어지는 전체 과정은 다음과 같습니다.

```text
1. projects/page.tsx가 getProjects() 호출
2. lib/projects.ts가 MDX 데이터 요청
3. lib/mdx.ts가 content/projects 폴더 읽기
4. gray-matter가 frontmatter와 본문 분리
5. 공개 여부·카테고리·검색어로 필터링
6. Project[] 배열 반환
7. page.tsx가 각 데이터를 ProjectCard에 전달
8. 브라우저에 프로젝트 카드 표시
```

### `lib/mdx.ts`

파일 시스템에서 MDX 파일을 읽는 가장 낮은 단계입니다.

중요한 Node.js 기능은 다음 두 가지입니다.

```ts
import fs from "node:fs";
import path from "node:path";
```

- `fs`: 파일과 폴더를 읽습니다.
- `path`: 운영체제에 맞는 파일 경로를 만듭니다.

이 코드는 서버에서만 실행되어야 합니다. 브라우저는 사용자의 컴퓨터에 있는 프로젝트 파일을 직접 읽을 수 없습니다.

### `lib/projects.ts`

MDX에서 읽은 값을 `Project` 형태로 바꾸고 필터링합니다.

```ts
getProjects({ category: "web", query: "Next.js" });
```

화면은 MDX 파일을 직접 읽지 않고 `getProjects()`만 사용합니다. 나중에 MDX가 DB로 바뀌더라도 페이지 코드의 변경을 줄이기 위한 구조입니다.

### 상세 본문 렌더링

상세 페이지에서는 `next-mdx-remote`의 `compileMDX`를 사용합니다.

```tsx
const { content } = await compileMDX({
  source: project.content,
});
```

MDX 문자열이 React가 화면에 표시할 수 있는 결과로 변환됩니다.

---

## 9. Server Component와 Client Component

App Router의 Component는 기본적으로 Server Component입니다.

### Server Component

서버에서 실행됩니다.

장점은 다음과 같습니다.

- 파일 시스템과 서버 데이터에 접근할 수 있습니다.
- 브라우저에 보내는 JavaScript 양을 줄일 수 있습니다.
- 초기 HTML을 서버에서 만들 수 있습니다.

현재 Server Component 예시:

- Home
- Projects/Log 목록
- Project/Log 상세
- Header와 Footer
- About

### Client Component

파일 위쪽에 `"use client"`가 있습니다.

```tsx
"use client";

import { useState } from "react";
```

브라우저에서 사용자 입력과 상태 변경을 처리할 때 사용합니다.

현재 Client Component:

- `SearchInput.tsx`
- `ContactForm.tsx`

### 모든 것을 Client Component로 만들면 안 되나요?

가능하지만 불필요한 JavaScript가 브라우저에 전달됩니다. 따라서 사용자 상호작용이 필요한 가장 작은 부분만 Client Component로 분리했습니다.

---

## 10. 카테고리·태그·검색 필터

필터 상태는 React 전역 상태가 아니라 URL에 저장됩니다.

```text
/projects?category=web&q=next
/log?category=dev&tag=MDX&q=content
```

이 방식의 장점:

- 새로고침해도 필터가 유지됩니다.
- 필터 결과 주소를 다른 사람에게 공유할 수 있습니다.
- 브라우저의 뒤로 가기를 자연스럽게 사용할 수 있습니다.
- Redux나 Zustand가 필요하지 않습니다.

### `searchParams`

목록 페이지는 URL 쿼리를 다음처럼 읽습니다.

```tsx
const values = await searchParams;
const query = typeof values.q === "string" ? values.q : undefined;
```

Next.js 16에서 `searchParams`도 Promise이므로 `await`이 필요합니다.

### 여러 필터를 동시에 유지하는 방법

`src/lib/search-params.ts`의 `createSearchHref()`가 현재 조건과 바꿀 조건을 합칩니다.

```ts
createSearchHref("/log", { category: "dev", tag: "MDX", q: "content" }, { category: "ai" });
```

결과:

```text
/log?category=ai&tag=MDX&q=content
```

따라서 카테고리를 바꾸더라도 태그와 검색어가 사라지지 않습니다.

검색 입력은 `useSearchParams()`로 현재 URL을 복사한 뒤 `q`만 변경합니다.

---

## 11. 프로젝트 이미지와 Hover

`ProjectCard.tsx`는 Next.js의 `Image` Component를 사용합니다.

```tsx
<Image src={project.thumbnailImage} alt={`${project.title} 대표 이미지`} fill />
```

일반 `<img>` 대신 `next/image`를 사용하면 Next.js가 이미지 크기와 로딩을 최적화할 수 있습니다.

마우스를 정확하게 사용할 수 있는 기기에서는 평소 이미지를 흑백으로 표시합니다.

```css
@media (hover: hover) and (pointer: fine) {
  .project-image img {
    filter: grayscale(1);
  }
}
```

같은 미디어 쿼리 안에서 마우스를 올리면 컬러로 바뀝니다.

```css
.project-card:hover .project-image img {
  filter: grayscale(0);
}
```

`hover: hover`는 마우스처럼 실제 hover가 가능한지를 확인하고, `pointer: fine`은 정밀한 포인터인지를 확인합니다. 스마트폰과 같은 터치 기기는 이 조건에 해당하지 않으므로 흑백 필터를 적용하지 않고 처음부터 컬러 이미지를 보여줍니다.

이처럼 모바일에 없는 동작을 기본 조건으로 두지 않는 것을 **점진적 향상**이라고 생각할 수 있습니다. 모든 기기에서 컬러 이미지를 볼 수 있고, 마우스가 있는 환경에서만 흑백→컬러 효과를 추가합니다.

제목과 설명 같은 필수 정보도 hover 상태와 관계없이 항상 표시합니다.

---

## 12. Metadata, Sitemap, Robots

### Metadata

검색 결과나 브라우저 탭에 사용할 제목과 설명입니다.

```ts
export const metadata = {
  title: "Projects",
  description: "만들면서 배운 프로젝트 기록",
};
```

상세 페이지는 MDX의 제목과 요약으로 Metadata를 동적으로 만듭니다.

### `sitemap.ts`

검색엔진에 사이트의 페이지 목록을 알려줍니다.

프로젝트와 로그가 추가되면 공개된 콘텐츠의 상세 주소도 sitemap에 포함됩니다.

### `robots.ts`

검색엔진 크롤러가 어떤 경로에 접근할 수 있는지 알려줍니다.

---

## 13. 새 프로젝트 콘텐츠 추가 실습

`src/content/projects` 안에 `my-first-project.mdx`를 만듭니다.

```mdx
---
title: "My First Project"
summary: "처음 추가해보는 연습용 프로젝트"
thumbnailImage: "/images/projects/ui-experiment.svg"
category: "experiment"
status: "in-progress"
techStack: ["Next.js", "TypeScript"]
period: { start: "2026-08" }
demoType: "link"
demoUrl: "https://example.com"
isPublished: true
isFeatured: false
createdAt: "2026-08-16"
---

## Overview

이 프로젝트를 만든 이유를 작성합니다.

## Problem / Goal

해결하려고 한 문제를 작성합니다.

## What I Learned

만들면서 배운 내용을 작성합니다.
```

개발 서버를 실행하고 다음 두 주소를 확인합니다.

```text
http://localhost:3000/projects
http://localhost:3000/projects/my-first-project
```

### 다운로드 프로젝트 예시

다운로드할 파일을 `public/downloads`에 넣었다고 가정합니다.

```yaml
demoType: "download"
downloadUrl: "/downloads/my-game.zip"
```

### 페이지 안에 데모를 삽입하는 예시

```yaml
demoType: "embed"
demoUrl: "https://example.com/demo"
```

외부 사이트가 iframe 삽입을 차단할 수 있으므로 모든 주소가 embed되는 것은 아닙니다.

---

## 14. 새 로그 추가 실습

`src/content/logs` 안에 `learning-next-routing.mdx`를 만듭니다.

```mdx
---
title: "Next.js 라우팅을 배우며 알게 된 것"
summary: "폴더 구조가 URL이 되는 과정을 정리한 기록"
category: "dev"
tags: ["Next.js", "App Router"]
isPublished: true
createdAt: "2026-08-16"
---

## 배운 내용

`app` 폴더 안의 구조가 URL과 연결됩니다.
```

다음 주소에서 목록과 상세를 확인합니다.

```text
http://localhost:3000/log
http://localhost:3000/log/learning-next-routing
```

---

## 15. 추천 학습 순서

### 1단계: 화면 구조

1. `src/app/layout.tsx`
2. `src/components/layout/Header.tsx`
3. `src/app/page.tsx`
4. `src/components/project/ProjectCard.tsx`
5. `src/styles/globals.css`

목표: Component와 Props가 무엇인지 이해합니다.

### 2단계: 파일 데이터

1. `src/content/projects/build-and-learn.mdx`
2. `src/lib/mdx.ts`
3. `src/lib/projects.ts`
4. `src/types/project.ts`

목표: MDX 파일이 `Project` 데이터가 되는 과정을 이해합니다.

### 3단계: 라우팅

1. `src/app/projects/page.tsx`
2. `src/app/projects/[slug]/page.tsx`
3. `generateStaticParams()`
4. `generateMetadata()`

목표: 목록과 동적 상세 페이지가 연결되는 방식을 이해합니다.

### 4단계: 검색과 필터

1. `src/components/project/ProjectFilterBar.tsx`
2. `src/components/log/LogFilterBar.tsx`
3. `src/components/search/SearchInput.tsx`
4. `src/lib/search-params.ts`

목표: URL에 여러 필터 상태를 저장하는 방식을 이해합니다.

### 5단계: 직접 확장

1. Project MDX 하나 추가
2. Log MDX 하나 추가
3. 새로운 태그로 필터 확인
4. 프로젝트 `demoType` 변경
5. CSS 포인트 색상 변경

---

## 16. 초보자가 자주 만나는 문제

### MDX를 추가했는데 목록에 나오지 않습니다

다음을 확인하세요.

```yaml
isPublished: true
```

파일 확장자가 `.mdx`인지도 확인합니다.

### 상세 페이지가 404입니다

- 파일명과 URL의 slug가 같은지 확인합니다.
- `isPublished`가 `true`인지 확인합니다.
- 개발 서버를 다시 시작해봅니다.

### 이미지가 표시되지 않습니다

`public` 아래 경로와 frontmatter 경로를 비교합니다.

```text
실제 파일: public/images/projects/example.svg
MDX 경로: /images/projects/example.svg
```

MDX 경로에는 `public`을 쓰지 않습니다.

### 카테고리 값에서 타입 오류가 납니다

Project는 다음 값만 사용할 수 있습니다.

```text
web / app / game / experiment
```

Log는 다음 값만 사용합니다.

```text
dev / ai / life / etc
```

### `params` 또는 `searchParams` 오류가 납니다

Next.js 16에서는 Promise이므로 `await`을 사용했는지 확인합니다.

### 코드를 수정했는데 정렬이 엉망입니다

```bash
npm run format
```

---

## 17. 다음에 공부하면 좋은 주제

현재 프로젝트를 이해한 뒤 다음 순서로 확장하는 것을 추천합니다.

1. React의 Component, Props, State
2. Server Component와 Client Component
3. App Router와 동적 Route
4. TypeScript union 타입
5. URLSearchParams
6. Next.js Metadata API
7. 정적 생성과 `generateStaticParams`
8. 웹 접근성과 시맨틱 HTML
9. 이미지 최적화
10. 배포와 환경변수

DB와 Admin은 MDX 운영이 실제로 불편해졌을 때 공부해도 늦지 않습니다.

---

## 18. 마지막 체크리스트

다음 질문에 답할 수 있다면 현재 구조의 핵심을 이해한 것입니다.

- `page.tsx`와 `layout.tsx`의 차이를 설명할 수 있나요?
- `[slug]`가 어떤 URL을 만드는지 설명할 수 있나요?
- Project MDX의 frontmatter와 본문의 차이를 아나요?
- `getProjects()`가 필요한 이유를 설명할 수 있나요?
- Server Component와 Client Component를 구분할 수 있나요?
- 필터 상태를 URL에 저장하는 이유를 설명할 수 있나요?
- `isPublished`와 `status`의 차이를 아나요?
- 새로운 프로젝트 MDX를 직접 추가할 수 있나요?

처음에는 코드를 외우기보다 데이터가 이동하는 흐름을 이해하는 것이 중요합니다.

```text
MDX → lib → page → component → HTML → 브라우저
```

이 한 줄을 기준으로 각 파일의 역할을 찾아가면 프로젝트 전체가 훨씬 쉽게 보입니다.

---

## 부록 A. TypeScript가 낯설다면

TypeScript는 JavaScript에 **타입**을 추가한 언어입니다. 코드를 실행하기 전에 "이 값은 문자열인데 숫자를 넣으려 했다" 같은 실수를 미리 잡아줍니다.

### 기본 타입

```ts
const title: string = "BUILD & LEARN";
const order: number = 1;
const isPublished: boolean = true;
const tags: string[] = ["Next.js", "MDX"];
```

콜론(`:`) 뒤에 타입을 적습니다. `string[]`은 "문자열이 여러 개 들어있는 배열"이라는 뜻입니다.

### 객체 모양을 정의하는 `type`

이 프로젝트는 `interface` 대신 `type`으로 데이터 모양을 정의합니다. 예를 들어 `src/types/project.ts`의 일부를 단순화하면 다음과 같습니다.

```ts
type Project = {
  slug: string;
  title: string;
  isFeatured: boolean;
  period: {
    start: string;
    end?: string;
  };
};
```

- `end?: string`처럼 이름 뒤에 물음표(`?`)가 붙으면 **없어도 되는 값**(optional)이라는 뜻입니다.
- 위 타입을 만들어두면 `Project` 값을 다루는 모든 코드에서 `project.title`이 항상 문자열이라는 것을 TypeScript가 보장해줍니다.

### 함수의 매개변수와 반환 타입

```ts
function getProjects(options: { category?: string; query?: string }): Project[] {
  // ...
}
```

- `options: { ... }`는 함수가 어떤 모양의 인자를 받는지 설명합니다.
- 함수 이름 뒤의 `: Project[]`는 이 함수가 항상 `Project` 배열을 반환한다는 뜻입니다.

### 정해진 값만 허용하는 union 타입

섹션 6에서 본 것처럼 여러 문자열 중 하나만 허용하고 싶을 때는 `|`(union)를 사용합니다.

```ts
type ProjectCategory = "web" | "app" | "game" | "experiment";
```

`"website"`처럼 목록에 없는 값을 넣으면 실행 전에 바로 오류로 표시됩니다. 이 오류가 바로 TypeScript가 버그를 미리 막아주는 순간입니다.

### 처음에는 이 정도만 알면 충분합니다

- 값 뒤에 `: 타입`이 붙어있으면 "이 값은 이런 모양이어야 한다"는 뜻이다.
- `?`가 붙은 필드는 없어도 된다.
- `|`로 연결된 값은 그중 하나만 가능하다.
- 빨간 밑줄(타입 오류)이 보이면 값의 모양이 정의와 다르다는 신호다.

---

## 부록 B. Tailwind CSS와 이 프로젝트의 실제 스타일 방식

`package.json`에는 `tailwindcss`가 포함되어 있지만, 이 프로젝트는 Tailwind를 흔히 알려진 방식(`className="flex items-center gap-4"`처럼 클래스를 여러 개 조합하는 유틸리티 우선 방식)으로 사용하지 않습니다. 처음 코드를 보면 "Tailwind라면서 왜 유틸리티 클래스가 안 보이지?"라고 혼란스러울 수 있어 정리합니다.

### 이 프로젝트가 실제로 하는 일

`src/styles/globals.css` 첫 줄에서 Tailwind를 불러오기만 합니다.

```css
@import "tailwindcss";
```

그 아래부터는 Tailwind 유틸리티 클래스 대신 직접 이름 지은 CSS 클래스와 CSS 변수를 사용합니다.

```css
:root {
  --accent: #ff4d00;
  --space-3: 24px;
}

.badge {
  /* ... */
}
```

컴포넌트에서는 이렇게 이름 붙인 클래스를 그대로 사용합니다.

```tsx
// src/components/ui/Badge.tsx
<span className={`badge ${variant === "tag" ? "badge-tag" : ""}`}>{children}</span>
```

### 클래스 이름의 의미를 찾는 방법

컴포넌트 코드에서 `className="badge"`처럼 처음 보는 클래스를 만나면, `src/styles/globals.css`에서 같은 이름(`.badge`)을 검색해 실제 스타일을 확인합니다.

```text
컴포넌트의 className="badge"
    ↓ 검색
globals.css의 .badge { ... }
    ↓
실제 색상, 크기, 여백 확인
```

### 왜 알아둬야 하나요?

Tailwind 공식 문서나 예제 코드를 보면 `className="text-sm font-bold text-blue-600"`처럼 클래스가 많이 나열된 모습을 자주 보게 됩니다. 이 프로젝트 코드에서 그런 형태를 찾을 수 없는 것은 오류가 아니라, `globals.css`에 직접 클래스를 정의하는 방식을 선택했기 때문입니다. Tailwind 학습 자료를 볼 때와 이 프로젝트 코드를 읽을 때 서로 다른 스타일 작성 방식이라는 점을 구분해두면 혼란이 줄어듭니다.

---

## 부록 C. 짧은 용어집

| 용어              | 뜻                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------- |
| Component         | 화면의 일부를 만드는 재사용 가능한 함수                                             |
| Props             | 부모가 자식 Component에 전달하는 값                                                 |
| Server Component  | 서버에서 실행되고 결과 HTML만 브라우저로 전달되는 Component                         |
| Client Component  | 브라우저에서 실행되며 클릭, 입력 같은 상호작용을 처리하는 Component                 |
| Hydration         | 서버가 만든 HTML에 브라우저가 JavaScript 동작을 연결하는 과정                       |
| Frontmatter       | MDX 파일 위쪽 `---` 사이에 있는 구조화된 정보                                       |
| Slug              | URL에 쓰이는 글의 고유 식별자 (예: `/projects/build-and-learn`의 `build-and-learn`) |
| Static Generation | 빌드 시점에 미리 페이지를 HTML로 만들어두는 방식                                    |
| Union 타입        | `"web" \| "app"`처럼 정해진 값 중 하나만 허용하는 TypeScript 타입                   |

---

## 부록 D. DB·로그인·Server Action이 추가된 뒤의 요청 흐름 (2026-09-13)

이 부록은 Spring/MyBatis 경험이 있고 React·Vue는 처음인 사람 기준으로, "브라우저 주소창에 뭔가 치면 실제로 어떤 파일이 순서대로 실행되는지"를 이 프로젝트의 실제 코드로 따라갑니다.

### 먼저, Spring과 비교한 큰 그림

Spring MVC는 보통 이렇게 나뉘어 있습니다.

```text
DispatcherServlet → Controller → Service → Repository(MyBatis) → View(JSP/Thymeleaf)
```

Next.js의 App Router(이 프로젝트가 쓰는 방식)는 **폴더 구조 자체가 라우팅 설정**이고, Controller와 View가 한 함수 안에 합쳐져 있습니다.

```text
폴더 경로 = URL 매핑 (@RequestMapping을 안 써도 됨)
page.tsx의 async 함수 = Controller + Service 호출 + View 렌더링을 한 번에
src/lib/*-db.ts = Repository (MyBatis Mapper 역할)
```

### 시나리오 A — 방문자가 홈(`/`)에 접속

```text
1. 브라우저: GET /
2. src/proxy.ts 실행 여부 확인
   → config.matcher가 "/admin/:path*"뿐이라 "/"는 매치 안 됨 → 프록시를 그냥 통과
3. Next.js가 "/" 에 맞는 라우트 파일을 src/app 안에서 찾음
   → src/app/(site)/page.tsx 가 매치됨
     ((site)처럼 괄호 폴더는 "라우트 그룹"이라 URL에는 안 나타남)
4. 레이아웃이 바깥 → 안쪽 순서로 겹쳐서 실행됨
   ① src/app/layout.tsx        (Root Layout: <html>/<body>, 폰트, 전역 CSS)
   ② src/app/(site)/layout.tsx (Site Layout: Header + Footer)
   ③ src/app/(site)/page.tsx   (Home 페이지 본문)
5. Home() 함수 자체가 Server Component라서 서버 안에서 바로
   getPublishedProjects(), getPublishedLogs() 를 호출 → Supabase(DB)를 조회
6. 완성된 결과를 HTML로 바꿔 브라우저로 전송 (Controller에서 View까지 한 번에 끝)
7. 브라우저는 이 HTML을 먼저 그대로 보여주고, 그다음 "Hydration"으로 JS를 붙여
   클릭 등 상호작용이 되게 함 (실제로 JS가 필요한 부분은 "use client" 컴포넌트뿐)
```

### 시나리오 B — 방문자가 Log 상세(`/log/[slug]`)에 접속하고 댓글을 남길 때

```text
1. 브라우저: GET /log/round-9-supabase-auth-admin-foundation
2. proxy.ts 매치 안 됨 → 그냥 통과
3. src/app/(site)/log/[slug]/page.tsx 매치, [slug] 부분이 실제 값으로 채워짐
4. LogDetail() 안에서 순서대로:
   - getPublishedLogBySlug(slug)  → DB에서 글 조회
   - compileMDX(...)              → 본문을 실제 화면 요소로 변환
   - supabase.auth.getUser()      → 지금 보는 사람이 로그인했는지 확인
   - getLogComments(slug)         → 댓글 목록 조회 (RLS가 "공개 글만" 자동 필터링)
5. 이 모든 결과를 담아 HTML 응답. 화면 아래 댓글 폼까지 이미 채워진 상태로 도착

── 여기서 "댓글 등록" 버튼을 누르면 ──

6. src/components/log/CommentSection.tsx는 "use client" → 이 부분만 브라우저 JS가 담당
7. 버튼 클릭 → addLogComment(slug, 댓글내용) 호출
   → 이건 겉보기엔 그냥 함수 호출이지만, 실제로는 브라우저가 Next.js 서버로
     몰래 요청을 보내는 것 (Spring의 @PostMapping 메서드 하나를 호출하는 것과 같은 효과)
8. src/app/(site)/log/[slug]/actions.ts의 addLogComment가 서버에서 실행:
   - 로그인 여부 다시 확인 (클라이언트를 못 믿으므로)
   - 글자수 검사
   - supabase.from("log_comments").insert(...) → DB에 저장 시도
   - Supabase의 RLS 정책이 "로그인했는가 + 자기 계정으로 쓰는가 + 공개 글인가"를 한 번 더 검사
   - revalidatePath(...) 로 "이 페이지 캐시는 이제 낡았다"고 표시
9. 성공하면 브라우저 쪽 화면 상태에 새 댓글을 바로 얹어서 새로고침 없이 보여줌
```

### 시나리오 C — 관리자가 `/admin`에 접속

```text
1. 브라우저: GET /admin
2. 이번엔 config.matcher("/admin/:path*")에 매치 → src/proxy.ts 실제로 실행
   - updateSession()으로 로그인 세션 쿠키 확인/자동 갱신
   - 로그인 안 되어 있으면 → /login으로 redirect, 여기서 끝
   - 로그인 되어 있으면 → 통과
3. src/app/admin/layout.tsx 실행
   (이 레이아웃은 (site) 그룹 밖이라 공개 사이트 Header/Footer가 안 붙고, 완전히 다른
    관리자 전용 레이아웃 + 사이드바를 씀)
   - 여기서 로그인 여부와 isAdminUser()를 "또" 확인 (proxy 하나만 믿지 않는 이중 확인)
   - 로그인은 했지만 관리자가 아니면 → "/"로 redirect (관리자 화면이 없는 것처럼 처리)
   - 사이드바에 표시할 안 읽은 문의 수 등을 미리 조회
4. src/app/admin/page.tsx (대시보드) 실행 → 콘텐츠 개수 등을 조회해 카드로 표시
```

### 정적(Static) vs 동적(Dynamic) 차이

- 홈처럼 누가 보든 내용이 같은 페이지는 Next.js가 빌드 시점에 미리 만들어두고 캐싱합니다 (그래서 빠릅니다).
- `/admin`은 로그인한 사람마다 다르고 실시간 데이터가 필요해서 매 요청마다 새로 그립니다.
- Log 상세는 원래 정적에 가까웠지만, 댓글이 추가되면서 `revalidatePath`로 "댓글이 달리면 그 페이지만 다시 그린다"는 방식으로 관리됩니다.

### 미니 용어집 추가분

| 용어                           | 뜻                                                                                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 라우트 그룹 `(site)`           | 괄호로 감싼 폴더 이름은 URL에 나타나지 않고, 그 안의 페이지들에 공통 레이아웃만 씌우는 용도                                                         |
| Server Action (`"use server"`) | 브라우저에서 함수처럼 호출하지만 실제로는 서버에서 실행되는 함수. Controller 메서드 하나를 만드는 것과 비슷하지만 URL·라우팅 설정을 직접 안 써도 됨 |
| RLS (Row Level Security)       | DB 자체가 "누가 요청했는가"에 따라 행 단위로 접근을 허용/차단. Java의 `@PreAuthorize`와 비슷하지만 DB 레벨에서 걸림                                 |
| revalidatePath                 | "이 URL의 캐시된 화면은 이제 낡았으니 다음 요청 때 새로 그려라"라고 Next.js에 알리는 함수                                                           |
| proxy.ts (구 middleware)       | 지정한 경로(matcher)로 오는 요청이 실제 페이지에 닿기 전에 한 번 거치는 공통 검문소                                                                 |

이 문서는 계속 확장해나갈 예정이므로, 실제로 막혔던 개념이나 새로 알게 된 내용이 있으면 이 부록에 이어서 추가하는 것을 권장합니다.
