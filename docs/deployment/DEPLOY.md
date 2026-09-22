# BUILD & LEARN 배포 가이드

이 문서는 BUILD & LEARN의 Vercel 재배포와 운영 검증 체크리스트입니다. GitHub 저장소·Vercel 프로젝트·운영 주소는 이미 연결되어 있으며, 최초 배포 절차는 역사 참고용으로만 유지합니다.

## 운영 재배포 절차

1. 작업 유형에 맞는 `docs/harness/QUALITY_GATES.md` 검증을 완료합니다.
2. Git diff에서 비밀값·예상하지 않은 파일 변경을 확인하고 커밋합니다.
3. Vercel Production 환경변수와 마이그레이션 적용 상태를 확인합니다.
4. 배포 후 공개 사이트·로그인·관리자·공개/비공개 콘텐츠 흐름을 확인합니다.
5. 결과와 남은 문제를 `PROJECT_STATUS.md`, `DEVELOPMENT_LOG.md`에 기록합니다.

## 배포 전 준비

- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run format:check`
- [ ] `npm run build`
- [ ] Git에 포함하면 안 되는 `.env*`, `.next`, `node_modules`가 `.gitignore`에 있는지 확인
- [ ] GitHub에 올릴 변경 파일을 다시 확인하고 커밋

이 프로젝트는 로컬과 Vercel의 Node 메이저 버전을 맞추기 위해 `package.json`에 Node `24.x`를 지정합니다.

## 1. GitHub에 저장소 올리기

> 최초 연결 당시의 참고 절차입니다. 현재 저장소와 Vercel 연결을 새로 만들 필요는 없습니다.

1. GitHub에서 새 저장소를 만듭니다.
2. 현재 프로젝트의 Git 원격 저장소를 연결합니다.
3. 작업 내용을 커밋하고 GitHub에 push합니다.
4. GitHub 저장소에서 `.env`, `.env.local`, `node_modules`, `.next`가 올라가지 않았는지 확인합니다.

민감한 값은 GitHub에 직접 올리지 않고 Vercel 환경변수에서 관리합니다.

## 2. Vercel에 처음 배포하기

1. [Vercel](https://vercel.com/)에 로그인합니다.
2. **Add New → Project**를 선택합니다.
3. GitHub에서 올린 BUILD & LEARN 저장소를 Import합니다.
4. Framework Preset이 **Next.js**인지 확인합니다. 일반적으로 자동 감지됩니다.
5. Root Directory, Build Command, Output Directory는 별도 구조를 쓰지 않으므로 기본값을 유지합니다.
6. **Deploy**를 누릅니다.

첫 배포가 끝나면 `프로젝트이름.vercel.app` 형태의 주소가 만들어집니다. 코드에서는 별도 사이트 URL을 설정하지 않았을 때 Vercel이 제공하는 `VERCEL_URL`을 사용합니다.

## 3. 사이트 URL 환경변수

사이트 주소의 우선순위는 다음과 같습니다.

1. `NEXT_PUBLIC_SITE_URL`
2. Vercel 프로덕션 주소인 `VERCEL_PROJECT_PRODUCTION_URL`
3. Vercel 자동 배포 주소인 `VERCEL_URL`
4. 로컬 기본값 `http://localhost:3000`

### 도메인이 아직 없을 때

`NEXT_PUBLIC_SITE_URL`을 설정하지 않아도 됩니다. Vercel 배포에서는 자동 주소가 metadata, OG 이미지 기준 주소, robots, sitemap에 사용됩니다.

## Supabase와 선택 기능 환경변수

Vercel Production에는 최소한 다음 값을 등록합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

아래 값은 기능을 사용할 때만 추가합니다.

- `RESEND_API_KEY`, `CONTACT_NOTIFY_TO`, `CONTACT_NOTIFY_FROM`: 새 문의 이메일 알림. 키가 없으면 문의는 DB에 저장되고 이메일만 생략됩니다.
- `ANTHROPIC_API_KEY`: Tech Radar 일일 다이제스트. 키가 없으면 다이제스트 생성만 실패하고 수집함은 정상 동작합니다.

`service_role` 또는 기타 비밀 키를 `NEXT_PUBLIC_*` 이름으로 등록하지 않습니다.

### 실제 도메인이 정해졌을 때

Vercel 프로젝트의 **Settings → Environment Variables**에서 다음 값을 추가합니다.

```text
Name: NEXT_PUBLIC_SITE_URL
Value: https://실제도메인.com
```

- 마지막 `/`는 붙이지 않는 것을 권장합니다.
- `https://`를 반드시 포함합니다.
- 실제 도메인용 값은 Production 환경에 설정합니다.
- 값을 바꾼 뒤에는 새로 배포해야 metadata와 정적 페이지에 반영됩니다.

## 4. 커스텀 도메인 연결

1. 도메인 구매처에서 사용할 도메인을 확보합니다.
2. Vercel 프로젝트의 **Settings → Domains**에서 도메인을 추가합니다.
3. Vercel이 안내하는 A 또는 CNAME 레코드를 확인합니다.
4. 도메인 구매처의 DNS 관리 화면에 안내받은 값을 입력합니다.
5. 연결이 완료될 때까지 기다립니다. DNS 반영에는 시간이 걸릴 수 있습니다.
6. SSL 인증서는 Vercel이 자동으로 발급하므로 별도 인증서 파일을 올리지 않습니다.
7. `NEXT_PUBLIC_SITE_URL`을 실제 `https://` 도메인으로 설정하고 다시 배포합니다.

## 5. 배포 후 화면 확인

- [ ] Vercel 프로젝트의 **Analytics** 탭에서 Analytics를 한 번 활성화한 뒤 새 Production 배포를 만듭니다. 코드만 추가해도 대시보드 기능은 자동 활성화되지 않습니다.
- [ ] Home 열기
- [ ] Projects 목록과 카테고리·검색 확인
- [ ] Project 상세와 embed/link/download 유형 확인
- [ ] Log 목록과 `Codex` 태그 확인
- [ ] Log 상세 열기
- [ ] About 열기
- [ ] Contact Form UI 확인
- [ ] Contact 문의가 DB에 저장되고, Resend 설정 시 알림 메일도 도착하는지 확인
- [ ] 관리자 로그인·로그아웃, Project·Log 작성/수정, draft/private 비공개 확인
- [ ] Tech Radar 수동 수집과 Claude 키 설정 시 다이제스트 초안 생성 확인
- [ ] 존재하지 않는 주소에서 404 확인
- [ ] 모바일 실제 기기 또는 390px 화면 확인
- [ ] 카드 이미지가 터치 기기에서 컬러로 보이는지 확인
- [ ] 데스크톱에서 흑백→컬러 Hover 확인
- [ ] 브라우저 콘솔 오류 확인
- [ ] Vercel Dashboard의 Analytics 탭에서 새 Production 배포의 페이지 조회가 집계되는지 확인

## 6. SEO와 공유 주소 확인

- [ ] 페이지 HTML의 `og:url` 또는 OG 이미지 주소가 현재 배포 주소를 사용하는지 확인
- [ ] `/robots.txt`가 현재 사이트의 `/sitemap.xml`을 가리키는지 확인
- [ ] `/sitemap.xml`의 모든 URL이 현재 사이트 주소를 사용하는지 확인
- [ ] 카카오톡, Slack 등 실제 사용할 서비스에 링크를 붙여 미리보기 확인

미리보기 캐시는 이전 값을 잠시 보여줄 수 있습니다. 환경변수나 OG 정보를 바꿨다면 재배포 후 서비스의 캐시 갱신 방법을 확인합니다.

## 7. 외부 이미지 사용 시

현재 프로젝트 이미지는 모두 `public/images`의 로컬 파일입니다. 나중에 외부 이미지 주소를 직접 사용하면 `next.config.ts`의 `images.remotePatterns`에 실제 이미지 도메인만 정확하게 추가해야 합니다.

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "example-project.vercel.app" },
  ],
}
```

사용하지 않는 임의의 도메인을 미리 허용하지 않습니다.

## 이번 작업에서 하지 않은 것

- Vercel 프로젝트 생성
- GitHub push
- 실제 배포 실행
- 도메인 구매와 DNS 변경
- 실제 연락처와 콘텐츠 교체
