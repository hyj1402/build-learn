# BUILD & LEARN Next.js 요청 흐름 지도

> 대상: Java/Spring/JSP는 조금 알지만 React·Vue·Next.js는 처음인 사람
>
> 기준: 2026-09-16 현재 BUILD & LEARN 소스코드

이 문서는 **서버를 켠 뒤 누군가 주소에 접속하면 어느 파일이 어떤 순서로 실행되는지**를 현재 프로젝트 코드로 추적하는 안내서다. 한 번에 외우는 것이 목적은 아니다. 처음에는 1~4장만 읽고, 실제 파일을 열어 문서와 함께 한 줄씩 따라가면 된다.

## 목차

1. 먼저 잡아둘 큰 그림
2. Spring/JSP/Tiles와의 대응표
3. 개발 서버를 켜는 순간
4. 홈(`/`)에 들어오는 전체 흐름
5. `app` 폴더가 URL이 되는 규칙
6. 레이아웃: Root와 공개 사이트 틀
7. 홈 화면이 DB 데이터를 카드로 만드는 과정
8. 목록·검색·상세 페이지 흐름
9. Server Component와 Client Component
10. 폼 제출: Contact Server Action
11. 로그인과 관리자 페이지
12. 파일을 읽는 추천 순서
13. `layout.tsx` 첫 네 줄 해설
14. 다음에 볼 `displayFont` 코드 미리보기
15. 자주 헷갈리는 용어

---

## 1. 먼저 잡아둘 큰 그림

이 사이트는 “주소에 맞는 화면을 만들고, 필요한 데이터를 Supabase에서 읽어 보여주는” Next.js 웹 애플리케이션이다.

```text
브라우저에서 주소 입력
        ↓
Next.js가 src/app 안에서 주소에 맞는 page.tsx를 찾음
        ↓
공통 layout.tsx들을 함께 적용
        ↓
page.tsx가 필요한 데이터를 lib 함수로 요청
        ↓
lib가 Supabase DB 조회
        ↓
페이지와 Component들이 HTML 형태의 화면을 만듦
        ↓
브라우저가 우선 HTML을 표시
        ↓
클릭·입력 등이 필요한 작은 부분에만 JavaScript 동작 연결(hydration)
```

Spring처럼 `Controller`, `Service`, `Repository`, `JSP`가 서로 다른 파일로 명확히 나뉘는 방식과 가장 다른 지점은 이것이다.

```text
Next.js page.tsx 한 파일 안에
  Controller 역할(요청의 주소에 대응)
  + Service 호출
  + JSP가 하던 화면 작성(JSX)
이 함께 들어갈 수 있다.
```

그렇다고 모든 역할이 뒤섞여 있다는 뜻은 아니다. DB 조회 로직은 `src/lib/*-db.ts`, 재사용 UI는 `src/components`, URL별 화면은 `src/app`으로 분리되어 있다.

---

## 2. Spring/JSP/Tiles와의 대응표

완전히 같은 기술은 아니지만, 처음 이해할 때는 아래처럼 대응시켜 생각하면 좋다.

| BUILD & LEARN / Next.js                   | Java Spring/JSP에서 비슷한 것            | 실제 의미                                       |
| ----------------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| `src/app/(site)/page.tsx`                 | `@GetMapping("/")` Controller + JSP 본문 | `/` 요청에 맞는 화면                            |
| `src/app/(site)/projects/page.tsx`        | `@GetMapping("/projects")`               | 프로젝트 목록 화면                              |
| `src/app/(site)/projects/[slug]/page.tsx` | `@GetMapping("/projects/{slug}")`        | slug가 바뀌는 상세 화면                         |
| `layout.tsx`                              | Tiles의 공통 레이아웃                    | 여러 페이지를 감싸는 공통 틀                    |
| `components/*`                            | JSP include, tag file, 공통 JSP 조각     | 재사용하는 화면 부품                            |
| `src/lib/projects-db.ts`                  | Service + Repository/Mapper에 가까움     | Supabase 조회와 화면용 데이터 변환              |
| `src/proxy.ts`                            | Filter / Interceptor                     | 특정 요청이 페이지에 닿기 전의 검사             |
| `"use server"` Action                     | `@PostMapping` 메서드                    | 폼 제출 시 서버에서 실행되는 처리               |
| `"use client"` Component                  | 브라우저 JavaScript                      | 클릭, 입력, 상태 변화가 필요한 UI               |
| Supabase RLS                              | DB 레벨 권한 규칙                        | 누가 어떤 행을 읽고 쓸 수 있는지 DB가 최종 검사 |

중요한 차이도 있다. JSP는 보통 서버가 HTML을 만들고 끝나지만, React 기반 화면은 서버 HTML을 받은 뒤에도 필요한 일부 Component가 브라우저에서 살아 움직인다. 이것이 hydration이다.

---

## 3. 개발 서버를 켜는 순간

프로젝트 루트에서 다음 명령을 실행한다.

```bash
npm run dev
```

이 명령은 `package.json`에 등록된 Next.js 개발 서버를 실행한다. Spring Boot의 `main()`과 완전히 같은 파일이 있는 것은 아니다. Next.js 도구가 개발 서버를 켜고, 들어오는 URL마다 `src/app` 폴더 구조를 보고 적절한 파일을 선택한다.

```text
npm run dev
   ↓
next dev 실행
   ↓
http://localhost:3000 대기
   ↓
요청이 올 때마다 src/app의 파일 구조로 라우트 선택
```

따라서 “애플리케이션 시작점 파일은 어디지?”라고 찾기보다, Next.js에서는 **`src/app`이 주소별 시작점들의 집합**이라고 생각하는 편이 정확하다.

---

## 4. 홈(`/`)에 들어오는 전체 흐름

사용자가 `http://localhost:3000/`을 열 때 실제 흐름이다.

```mermaid
flowchart TD
  A[브라우저: GET /] --> B{src/proxy.ts matcher와 일치?}
  B -->|아니오: /는 공개 경로| C[라우트 탐색]
  C --> D[src/app/(site)/page.tsx]
  D --> E[src/app/layout.tsx<br/>html, body, 폰트, 전역 CSS]
  D --> F[src/app/(site)/layout.tsx<br/>Header, main, Footer]
  D --> G[Home 함수]
  G --> H[getPublishedProjects]
  G --> I[getPublishedLogs]
  H --> J[Supabase projects 조회]
  I --> K[Supabase logs 조회]
  J --> L[ProjectCard들로 JSX 생성]
  K --> M[LogCard들로 JSX 생성]
  E --> N[완성된 HTML 응답]
  F --> N
  L --> N
  M --> N
  N --> O[브라우저 화면 표시]
```

### 4-1. `proxy.ts`는 홈에서 실행되지 않는다

`src/proxy.ts`의 matcher는 현재 다음과 같다.

```ts
matcher: ["/admin/:path*"];
```

즉 `/admin`과 그 아래 주소만 검사한다. 홈(`/`), 프로젝트(`/projects`), 로그(`/log`) 같은 공개 화면은 이 단계를 거치지 않는다. 모든 공개 방문 때 로그인 세션을 확인하는 불필요한 DB/인증 왕복을 피하려는 선택이다.

### 4-2. `/`에 해당하는 파일 찾기

홈 화면은 다음 파일이다.

```text
src/app/(site)/page.tsx
```

`(site)`는 URL에 포함되지 않는 **라우트 그룹**이다. 폴더명에 괄호를 쓰면 “주소 이름”이 아니라 “공통 레이아웃을 묶기 위한 분류”가 된다.

```text
파일 경로: src/app/(site)/page.tsx
실제 URL: /

파일 경로: src/app/(site)/projects/page.tsx
실제 URL: /projects
```

### 4-3. 레이아웃은 바깥에서 안쪽 순서로 겹친다

홈 본문만 실행되는 것이 아니다. 아래 세 파일이 합쳐진다.

```text
1. src/app/layout.tsx         모든 화면의 최외곽 html/body
2. src/app/(site)/layout.tsx  공개 화면의 Header/main/Footer
3. src/app/(site)/page.tsx    홈 고유 내용
```

결과 모양은 다음과 같다.

```html
<html>
  <body>
    <header />
    <main>
      <Home의 hero, 프로젝트 카드, 로그 카드 />
    </main>
    <footer />
  </body>
</html>
```

`Header`와 `Footer`는 Root Layout이 아니라 공개 사이트 전용 `(site)/layout.tsx`에 있다. 그래서 `/admin`은 공개 메뉴를 자동으로 물려받지 않는다.

---

## 5. `app` 폴더가 URL이 되는 규칙

Next.js App Router에서는 별도의 `@RequestMapping` 설정 대신 폴더와 파일 이름이 URL 규칙이다.

| 파일                                      | URL                   | 설명                                     |
| ----------------------------------------- | --------------------- | ---------------------------------------- |
| `src/app/(site)/page.tsx`                 | `/`                   | 홈                                       |
| `src/app/(site)/projects/page.tsx`        | `/projects`           | 프로젝트 목록                            |
| `src/app/(site)/projects/[slug]/page.tsx` | `/projects/어떤-slug` | 프로젝트 상세                            |
| `src/app/(site)/log/page.tsx`             | `/log`                | 학습 로그 목록                           |
| `src/app/(site)/log/[slug]/page.tsx`      | `/log/어떤-slug`      | 학습 로그 상세                           |
| `src/app/(site)/contact/page.tsx`         | `/contact`            | 문의 화면                                |
| `src/app/(site)/login/page.tsx`           | `/login`              | 로그인 화면                              |
| `src/app/admin/page.tsx`                  | `/admin`              | 관리자 대시보드                          |
| `src/app/auth/callback/route.ts`          | `/auth/callback`      | 화면이 아니라 인증 처리용 GET 엔드포인트 |

### `[slug]`는 `@PathVariable`과 비슷하다

예를 들어 사용자가 `/projects/build-learn`에 들어오면 아래와 같이 생각할 수 있다.

```text
/projects/build-learn
          └──────── slug = "build-learn"
```

Next.js 16에서는 `params`를 `await`으로 읽는다.

```tsx
export default async function ProjectDetail({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  // slug로 DB에서 해당 프로젝트를 찾는다.
}
```

Spring으로 옮겨 생각하면 대략 이런 느낌이다.

```java
@GetMapping("/projects/{slug}")
public String detail(@PathVariable String slug, Model model) { ... }
```

---

## 6. 레이아웃: Root와 공개 사이트 틀

### 6-1. Root Layout — `src/app/layout.tsx`

이 파일은 사이트 전체의 가장 바깥 껍데기다. 모든 URL에 공통으로 적용된다.

주요 책임은 다음과 같다.

- `<html lang="ko">`, `<body>`를 만든다.
- Google 폰트를 Next.js 방식으로 등록한다.
- `src/styles/globals.css` 전역 스타일을 불러온다.
- 브라우저 탭 제목, 공유 이미지 등 기본 metadata를 정의한다.
- 사용자가 고른 라이트/다크 테마를 화면이 깜빡이기 전에 적용한다.

Tiles로 비유하면 모든 페이지가 거치는 최상단 레이아웃이다. 단, 여기에는 Header/Footer를 넣지 않았다.

### 6-2. Site Layout — `src/app/(site)/layout.tsx`

공개 사이트에만 붙는 레이아웃이다.

```tsx
<Header />
<main id="main-content">{children}</main>
<Footer />
```

여기서 `children`은 “이 레이아웃 안에 들어온 현재 페이지의 내용”이다. 홈이면 Home의 JSX, `/projects`면 프로젝트 목록 JSX가 이 자리에 들어간다.

Java/JSP 식으로 매우 느슨하게 비유하면 다음과 비슷하다.

```jsp
<tiles:insertAttribute name="header" />
<main>
  <tiles:insertAttribute name="body" />
</main>
<tiles:insertAttribute name="footer" />
```

### 6-3. Admin Layout — `src/app/admin/layout.tsx`

`/admin`은 `(site)` 폴더 밖에 있다. 따라서 공개 Header/Footer 대신 관리자 전용 레이아웃을 사용한다. 이 레이아웃은 로그인 여부와 관리자 권한도 다시 확인한다.

---

## 7. 홈 화면이 DB 데이터를 카드로 만드는 과정

홈 파일의 핵심은 다음이다.

```tsx
export default async function Home() {
  const projects = (await getPublishedProjects({ featured: true })).slice(0, 3);
  const logs = (await getPublishedLogs()).slice(0, 3);
  // 아래 JSX에서 ProjectCard, LogCard로 출력
}
```

### 7-1. `async`와 `await`

DB 호출은 즉시 끝나지 않는다. 기다리는 동안 서버가 멈춘다는 의미가 아니라, 이 함수의 결과가 준비될 때까지 기다렸다가 다음 줄을 실행한다는 뜻이다.

```ts
const projects = await getPublishedProjects();
```

Java의 `CompletableFuture`를 기다리는 것과 비슷하게 볼 수 있지만, JavaScript 문법은 `await`으로 더 짧게 쓴다.

### 7-2. DB 함수 — `src/lib/projects-db.ts`

페이지가 Supabase 코드를 직접 길게 쓰지 않도록, DB 관련 일을 한 파일에 모아두었다.

```text
page.tsx
  ↓ getPublishedProjects()
projects-db.ts
  ↓ createClient(), supabase.from("projects").select(...)
Supabase Postgres
  ↓ rows
projects-db.ts
  ↓ toProject()으로 화면용 Project 형태 변환
page.tsx
```

`getPublishedProjects()`는 다음 일을 한다.

1. 서버용 Supabase client를 만든다.
2. `projects` 테이블에서 `publication_status = published`인 행만 조회한다.
3. 최신 공개 순서로 정렬한다.
4. DB의 한 행을 카드와 상세 화면이 이해하는 `Project` 형태로 바꾼다.
5. 카테고리, 추천 여부, 검색어 조건을 적용한다.
6. `Project[]` 배열을 페이지에 돌려준다.

이 함수는 Spring의 Service와 Repository/Mapper 사이 역할을 함께 한다. 프로젝트 규모가 더 커지면 Service와 Repository를 더 세분화할 수도 있지만, 현재 규모에서는 데이터 접근을 한 곳에 두는 편이 읽기 쉽다.

### 7-3. 배열을 카드 Component로 바꾸기

```tsx
{
  projects.map((project, index) => (
    <ProjectCard key={project.slug} project={project} priority={index < 3} />
  ));
}
```

`projects`는 여러 프로젝트가 든 배열이다. `map()`은 배열의 각 항목마다 `<ProjectCard />` 하나를 만들어 새 배열로 돌려준다.

```text
[프로젝트A, 프로젝트B, 프로젝트C]
              ↓ map
[카드A, 카드B, 카드C]
```

- `project={project}`: 현재 프로젝트 데이터를 카드에게 props로 전달한다.
- `key={project.slug}`: React가 목록 항목을 구분하는 고유표다. 화면에 글자로 보이지 않는다.
- `priority={index < 3}`: 첫 화면에서 중요한 이미지라는 힌트를 Next Image에 전달한다.

`ProjectCard`는 Java 클래스의 객체라기보다, **props를 입력받아 JSX를 반환하는 화면용 함수**라고 이해하면 된다.

---

## 8. 목록·검색·상세 페이지 흐름

### 8-1. 목록과 URL 검색 조건

프로젝트 목록의 주소는 다음처럼 될 수 있다.

```text
/projects?category=web&q=next
```

여기서 `category`, `q`는 URL의 query string이다. Spring에서는 `@RequestParam`에 가까운 값이다.

```text
브라우저 URL
  ↓ searchParams
projects/page.tsx
  ↓ getPublishedProjects({ category, query })
projects-db.ts
  ↓ DB 조회 + 조건 적용
ProjectCard 목록
```

필터를 React 전역 상태에만 두지 않고 URL에 둔 이유는 새로고침, 뒤로 가기, 링크 공유에도 현재 조건이 유지되기 때문이다.

### 8-2. 프로젝트 상세

```text
GET /projects/build-learn
  ↓
src/app/(site)/projects/[slug]/page.tsx
  ↓ slug = "build-learn"
getPublishedProjectBySlug(slug)
  ↓
공개 프로젝트 DB 데이터 조회
  ↓
본문 MDX를 compileMDX로 화면 요소로 변환
  ↓
상세 HTML 응답
```

이 프로젝트는 본문을 DB의 `body_text`에서 읽고, `compileMDX`로 화면에 렌더링한다. 예전 `src/content`의 MDX 파일은 현재 운영 데이터의 원본이 아니라 백업·호환성 확인용이다.

### 8-3. `not-found.tsx`

프로젝트나 로그를 찾지 못하면 상세 페이지가 `notFound()`를 호출할 수 있다. 그러면 `src/app/not-found.tsx`가 404 화면을 담당한다. Spring에서 상태 코드 404와 오류 화면을 반환하는 경우에 해당한다.

---

## 9. Server Component와 Client Component

### 9-1. 기본은 Server Component

`"use client"`가 파일 맨 위에 없으면 App Router Component는 기본적으로 서버에서 실행된다.

예: 홈 `page.tsx`는 서버에서 Supabase DB를 조회하고 HTML을 만든다.

```tsx
export default async function Home() {
  const projects = await getPublishedProjects();
  return <ProjectCard project={projects[0]} />;
}
```

서버 컴포넌트의 장점은 DB 키나 서버 코드가 브라우저에 노출되지 않고, 브라우저로 보내는 JavaScript 양도 줄일 수 있다는 점이다.

### 9-2. Client Component가 필요한 때

파일 첫 줄의 다음 선언은 “이 Component는 브라우저에서도 실행해야 한다”는 표시다.

```tsx
"use client";
```

클릭, 키 입력, `useState`, `useEffect`, 브라우저 API(`localStorage` 등)가 필요할 때 사용한다.

현재 예시는 `ContactForm`, Google 로그인 버튼, 댓글 UI, 관리자 편집 폼 등이다.

```text
Server Component
  - DB 조회
  - 비밀 환경변수 사용 가능
  - 초기 HTML 생성

Client Component
  - 버튼 클릭 처리
  - 입력값 변화 처리
  - 브라우저 상태 처리
```

모든 파일에 `"use client"`를 붙이면 편해 보일 수 있지만, 서버에서 할 수 있는 일까지 브라우저 JavaScript로 보내게 된다. 그래서 이 프로젝트는 **상호작용이 필요한 가장 작은 화면 부품만** Client Component로 둔다.

### 9-3. Hydration

서버가 처음 보내는 HTML만으로도 글과 카드는 먼저 보인다. 이후 브라우저가 필요한 Client Component JavaScript를 받아 “이 버튼은 클릭 가능”, “이 입력칸은 상태를 가진다”처럼 동작을 연결한다. 이 연결 과정이 hydration이다.

---

## 10. 폼 제출: Contact Server Action

문의 페이지는 화면과 서버 처리가 나뉜 대표 사례다.

```text
src/app/(site)/contact/page.tsx
  ↓ 화면에 ContactForm 배치
src/components/contact/ContactForm.tsx (Client Component)
  ↓ 사용자가 submit
src/app/(site)/contact/actions.ts (Server Action)
  ↓ 서버 검증
Supabase contact_messages 테이블 insert
  ↓
성공/오류 상태를 ContactForm에 반환
```

`actions.ts`의 첫 줄은 다음과 같다.

```ts
"use server";
```

이 선언이 붙은 `submitContactMessage()`는 브라우저에서 직접 DB에 연결하는 함수가 아니다. Client Component가 폼 action으로 사용하면 Next.js가 서버에 요청을 보내고, 함수 본문은 서버에서 실행된다.

Spring 감각으로는 “별도의 `/contact` POST Controller URL을 직접 만들지 않고, 폼과 가까이 둔 `@PostMapping` 처리” 정도로 비유할 수 있다.

서버에서 다시 검사하는 이유도 중요하다. 브라우저의 required, maxlength 검사는 사용자가 개발자 도구로 우회할 수 있으므로, 서버에서 이름·이메일·본문을 검증한 뒤에만 DB에 넣는다.

```text
브라우저 검사 = 사용자 편의를 위한 1차 안내
서버 검사 = 신뢰할 수 있는 실제 검증
RLS/DB 규칙 = 마지막 안전망
```

저장이 끝난 뒤 `after()`로 이메일 알림을 보낸다. 이 작업은 응답을 늦추지 않으며, 알림 전송이 실패하더라도 이미 DB에 저장된 문의는 사라지지 않는다.

---

## 11. 로그인과 관리자 페이지

### 11-1. Google 로그인 콜백

```text
로그인 버튼 클릭
  ↓
Google/Supabase 로그인 과정
  ↓
/auth/callback?code=...
  ↓
src/app/auth/callback/route.ts의 GET()
  ↓
exchangeCodeForSession(code)
  ↓
로그인 세션을 쿠키에 저장
  ↓
로그인 전 보던 주소 또는 /로 이동
```

`route.ts`는 화면을 반환하는 `page.tsx`와 다르다. `GET`, `POST` 같은 HTTP 메서드를 직접 export하는 API/처리 엔드포인트다. Spring Controller의 메서드에 더 가까운 형태다.

### 11-2. `/admin` 보호 흐름

```mermaid
flowchart TD
  A[GET /admin] --> B[src/proxy.ts]
  B --> C[updateSession: 세션 쿠키 확인·갱신]
  C -->|로그인 없음| D[/login?redirectTo=/admin 으로 redirect]
  C -->|로그인 있음| E[src/app/admin/layout.tsx]
  E --> F{isAdminUser 확인}
  F -->|아님| G[/ 로 redirect]
  F -->|관리자| H[admin/page.tsx 또는 하위 관리 화면]
```

관리자 검사를 두 번 하는 것은 실수가 아니다.

1. `proxy.ts`: 로그인하지 않은 사람이 관리자 페이지에 들어오는 것을 빠르게 막는다.
2. `admin/layout.tsx`와 각 서버 처리: 실제로 권한이 있는지 다시 확인한다.
3. Supabase RLS: DB가 최종적으로 허용/차단한다.

프록시 하나만 믿으면 다른 서버 요청 경로에서 우회될 여지가 생길 수 있으므로, 실제 데이터 변경 함수에서도 권한을 확인해야 한다.

---

## 12. 파일을 읽는 추천 순서

처음부터 모든 파일을 보면 길을 잃기 쉽다. 아래 순서로 한 파일씩 열고, 모르는 문법은 이 문서의 용어집으로 돌아오는 방식이 좋다.

### 1단계 — 화면의 뼈대

1. `src/app/layout.tsx`
2. `src/app/(site)/layout.tsx`
3. `src/app/(site)/page.tsx`
4. `src/components/layout/Header.tsx`
5. `src/components/project/ProjectCard.tsx`
6. `src/styles/globals.css`

목표: “페이지, 레이아웃, Component, props”가 무엇인지 잡는다.

### 2단계 — 데이터가 오는 길

1. `src/lib/projects-db.ts`
2. `src/lib/logs-db.ts`
3. `src/lib/supabase/server.ts`
4. `src/types/project.ts`
5. `src/types/log.ts`

목표: DB 행이 화면용 데이터로 바뀌는 과정을 이해한다.

### 3단계 — 주소와 상세 페이지

1. `src/app/(site)/projects/page.tsx`
2. `src/app/(site)/projects/[slug]/page.tsx`
3. `src/app/(site)/log/page.tsx`
4. `src/app/(site)/log/[slug]/page.tsx`
5. `src/app/not-found.tsx`

목표: URL, `searchParams`, `[slug]`, 404를 연결한다.

### 4단계 — 브라우저 상호작용

1. `src/components/contact/ContactForm.tsx`
2. `src/app/(site)/contact/actions.ts`
3. `src/components/log/CommentSection.tsx`
4. `src/app/(site)/log/[slug]/actions.ts`

목표: `"use client"`, `"use server"`, 폼 제출을 이해한다.

### 5단계 — 인증과 운영

1. `src/proxy.ts`
2. `src/lib/supabase/middleware.ts`
3. `src/app/(site)/login/page.tsx`
4. `src/app/auth/callback/route.ts`
5. `src/app/admin/layout.tsx`
6. `src/lib/auth/admin.ts`

목표: 로그인·권한·관리자 화면의 경계를 이해한다.

---

## 13. `layout.tsx` 첫 네 줄 해설

`src/app/layout.tsx`는 다음 네 import로 시작한다.

```ts
import type { Metadata } from "next";
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "@/styles/globals.css";
```

### 먼저: `import`는 Java의 import와 비슷한가?

큰 틀에서는 맞다. 다른 파일이나 라이브러리가 제공하는 기능을 현재 파일에서 쓰기 위해 가져오는 문법이다.

하지만 TypeScript/JavaScript에서는 “실행할 코드”를 가져올 수도 있고, “타입 검사에만 쓸 이름” 또는 “CSS 파일을 적용하라”는 효과를 가져올 수도 있다. 위 네 줄은 각각 서로 조금 다르다.

### 13-1. `import type { Metadata } from "next";`

```ts
import type { Metadata } from "next";
```

- `next`: `npm install`로 설치된 Next.js 외부 라이브러리다. Java의 Maven/Gradle 의존성과 비슷하다.
- `Metadata`: metadata 객체가 어떤 모양이어야 하는지 알려주는 TypeScript **타입**이다.
- `type`: 이 이름은 실행할 때 필요 없고, 개발 중 타입 검사에만 쓴다는 표시다.

실제 사용 위치는 아래다.

```ts
export const metadata: Metadata = {
  title: "...",
  description: "...",
};
```

Java의 interface 또는 DTO의 필드 규칙을 컴파일러가 확인하는 것과 비슷하다. `Metadata` 자체가 브라우저로 전달되거나 실행되는 것은 아니다. TypeScript가 JavaScript로 변환될 때 이 import는 사라진다.

### 13-2. `import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";`

```ts
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";
```

- `next/font/google`도 설치된 Next.js 패키지 안의 기능이다.
- `Noto_Sans_KR`, `Space_Grotesk`는 각각 폰트를 설정하는 함수다.
- 중괄호 `{ }`는 그 모듈이 여러 개 내보낸 이름 중 필요한 **named export**만 가져온다는 뜻이다.

나중에 아래처럼 호출해 폰트 설정을 만든다.

```ts
const bodyFont = Noto_Sans_KR({ ... });
```

일반 웹 폰트 `<link>`를 직접 작성하는 대신, Next.js가 빌드 과정에서 폰트 파일·CSS를 최적화하도록 맡기는 방식이다.

### 13-3. `import { SITE_URL } from "@/lib/site";`

```ts
import { SITE_URL } from "@/lib/site";
```

이것은 외부 라이브러리가 아니라 **이 프로젝트 안의 코드**를 가져오는 것이다.

```text
@/lib/site
  ↓
src/lib/site.ts
```

`@/`는 `src/`를 가리키도록 설정한 별칭(alias)이다. 상대경로 `../../../lib/site`를 쓰는 대신 `@/lib/site`라고 쓰므로, 폴더 깊이가 바뀌어도 경로가 더 읽기 쉽다.

`SITE_URL`은 사이트의 기준 URL을 담은 상수이며, 이 Layout의 `metadataBase: new URL(SITE_URL)`에서 사용한다. 공유 이미지 같은 상대 주소를 완전한 주소로 만들 때 기준점이 된다.

### 13-4. `import "@/styles/globals.css";`

```ts
import "@/styles/globals.css";
```

이 import에는 변수 이름이 없다. CSS 파일에서 함수나 값을 받아오는 것이 아니라, “이 CSS를 이 앱의 전역 스타일로 포함하라”는 **부수 효과(side effect) import**다.

Tiles의 master layout이나 공통 JSP에서 `<link rel="stylesheet">`로 전체 CSS를 연결하는 것과 역할이 비슷하다. Next.js가 실제 CSS 묶음과 로딩을 처리한다.

---

## 14. 다음에 볼 `displayFont` 코드 미리보기

바로 다음 코드는 이 부분이다.

```ts
const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});
```

한 줄씩 먼저 읽으면 다음과 같다.

| 코드 조각            | 뜻                                                      | Java 감각의 비유                                                           |
| -------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| `const`              | 변수 이름에 다른 값을 다시 대입하지 않음                | 지역 변수에 `final`을 붙인 것과 비슷함. 객체 내부까지 불변이라는 뜻은 아님 |
| `displayFont`        | 이 폰트 설정 결과를 담을 변수명                         | `displayFont` 지역 변수                                                    |
| `Space_Grotesk(...)` | import한 폰트 설정 함수를 호출                          | `new`를 쓰지 않는 factory 함수 호출에 가까움                               |
| `{ ... }`            | 설정값을 한 덩어리 객체로 전달                          | Builder 설정 또는 Map/설정 DTO를 넘기는 느낌                               |
| `subsets`            | 내려받아 쓸 문자 범위                                   | 여기서는 라틴 문자 폰트 파일                                               |
| `weight`             | 필요한 글자 굵기                                        | 500, 700 굵기만 준비                                                       |
| `variable`           | CSS에서 사용할 변수 이름                                | CSS custom property `--font-display`                                       |
| `display: "swap"`    | 폰트가 늦게 오면 대체 폰트를 먼저 보이고, 준비되면 교체 | 글자가 빈 채로 기다리는 현상을 줄임                                        |

호출 결과는 나중에 다음 부분에서 사용된다.

```tsx
<html className={`${displayFont.variable} ${bodyFont.variable}`}>
```

즉 `displayFont` 자체를 화면에 출력하는 것이 아니다. Next.js가 만든 CSS 클래스 이름을 `<html>`에 붙이고, CSS가 `--font-display`를 참조할 수 있도록 준비하는 설정 객체다.

`bodyFont = Noto_Sans_KR(...)`도 원리는 같고, 본문 한국어용 폰트와 굵기 목록·CSS 변수 이름만 다르다.

---

## 15. 자주 헷갈리는 용어

| 용어             | 짧은 뜻                                                             |
| ---------------- | ------------------------------------------------------------------- |
| React            | 화면을 Component 단위로 만드는 JavaScript 라이브러리                |
| Next.js          | React 위에 라우팅, 서버 렌더링, 빌드, metadata 등을 더한 프레임워크 |
| Component        | props를 받아 화면(JSX)을 돌려주는 재사용 가능한 함수/부품           |
| JSX              | JavaScript/TypeScript 안에 HTML처럼 화면을 쓰는 문법                |
| Props            | 부모 Component가 자식 Component에 전달하는 값                       |
| Layout           | 여러 페이지에 공통으로 적용되는 화면 틀                             |
| Route            | URL과 처리 파일의 연결                                              |
| Route Group      | `(site)`처럼 URL에는 보이지 않는 파일 정리용 폴더                   |
| Slug             | URL에 쓰는 사람이 읽을 수 있는 고유 문자열                          |
| Server Component | 서버에서 실행되어 HTML을 만드는 기본 Component                      |
| Client Component | 브라우저에서도 실행되어 클릭·입력을 처리하는 Component              |
| Server Action    | 폼 등에서 호출하지만 서버에서 실행되는 함수                         |
| Hydration        | 서버 HTML에 브라우저 JavaScript 동작을 연결하는 과정                |
| Metadata         | 탭 제목, 검색 결과 설명, SNS 공유 정보                              |
| RLS              | DB가 행 단위로 최종 권한을 검사하는 Supabase 정책                   |

---

## 이 문서를 쓰는 방법

파일을 읽다가 모르는 한 줄이 나오면 다음 순서로 보면 좋다.

1. 그 줄이 `import`, 변수 선언, 함수 호출, JSX 중 무엇인지 구분한다.
2. 그 값이 어디서 왔는지 import 또는 함수 정의로 한 단계만 따라간다.
3. 그 값이 어디에 쓰이는지 검색한다.
4. 한 번에 전체 구현을 파고들지 말고, “입력 → 처리 → 출력”만 먼저 확인한다.

예를 들어 `displayFont.variable`을 봤다면 다음 한 단계만 따라가면 된다.

```text
Space_Grotesk(...)의 반환값
  ↓
displayFont 변수
  ↓
<html className={displayFont.variable}>
  ↓
globals.css에서 --font-display을 사용하는 스타일
```

코드 이해는 “모든 문법을 외운 뒤 시작하는 일”이 아니다. 지금처럼 실제 내 프로젝트의 요청 하나를 처음부터 끝까지 따라가는 것이 가장 빠른 방법이다.
