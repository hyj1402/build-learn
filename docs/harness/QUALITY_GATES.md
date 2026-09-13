# 완료 조건

## 기본 자동 검증

```bash
npm run lint
npm run type-check
npm run format:check
npm run build
```

애플리케이션 코드·의존성·설정 변경은 네 명령이 모두 통과해야 완료로 판단합니다. 실패한 검증이 있다면 원인과 영향을 기록하고, 완료가 아닌 `보류` 또는 `진행 중`으로 남깁니다.

## 작업별 추가 검증

### 문서만 변경한 경우

- `npm run format:check`
- 변경한 문서의 링크·경로와 코드 설명 대조
- Git diff에서 비밀값·의도하지 않은 파일 변경 확인

### UI 변경

- 데스크톱과 모바일 화면
- 키보드 탐색과 기본 접근성
- 브라우저 콘솔 오류와 가로 넘침

### Supabase·Auth·Storage 변경

- 새 마이그레이션 파일과 원격 스키마/RLS 대조
- 허용 요청과 거부 요청을 각각 실제로 확인
- DB Security/Performance Advisor 확인
- `NEXT_PUBLIC_*`에 secret/service-role 키가 없는지 확인

### 배포·환경변수 변경

- Vercel에서 로그인·관리자·공개/비공개 콘텐츠 흐름 확인
- `/robots.txt`, `/sitemap.xml`, metadata/OG URL 확인
- 환경변수가 필요한 선택 기능(Resend, Claude)은 키가 없는 경우의 정상 동작도 확인

## 변경 검토

- 요청한 기능과 직접 관련된 파일만 변경했는지 확인합니다.
- 새로운 오류, 경고, 타입 문제가 없는지 확인합니다.
- 비밀키, 토큰, 개인 정보가 Git diff에 포함되지 않았는지 확인합니다.
- 링크, 경로, 문서 설명이 실제 코드와 일치하는지 확인합니다.
