# 작업 절차

## 작업 시작 전

1. `AGENTS.md`와 이 문서를 읽습니다.
2. `docs/harness/PROJECT_STATUS.md`에서 현재 구현 범위를 확인합니다.
3. 기능·DB·배포처럼 변경이 발생하는 작업이면 `docs/development/DEVELOPMENT_REQUEST.md`에 요청 배경, 변경 범위, 완료 조건을 기록합니다. 단순 조사·문서 점검은 결과가 상태 문서를 바꾸는 경우에만 기록합니다.
4. 관련 코드와 문서를 먼저 조사한 뒤 변경합니다.

## 구현 중

- 요청 범위를 벗어난 기능을 임의로 추가하지 않습니다.
- 새 기능과 데이터 흐름에는 `docs/guides/CODE_COMMENT_GUIDE.md`에 맞는 한국어 주석을 작성합니다.
- 사용자에게 보이는 동작이 바뀌면 관련 MDX 콘텐츠와 학습 문서도 확인합니다.
- 비밀값은 저장소에 커밋하지 않고 필요할 때 `.env.example`에 변수 이름만 기록합니다.
- 이미 적용된 Supabase 마이그레이션은 수정·삭제하지 않습니다. 수정이 필요하면 새 마이그레이션과 검증 계획을 추가합니다.

## 작업 유형별 분기

### 문서·조사 작업

- 관련 코드와 최신 개발 로그를 대조해 사실과 계획을 구분합니다.
- `format:check`, 링크·경로 확인, Git diff 검토를 기본으로 합니다.
- 기능·DB 동작을 바꾸지 않았다면 전체 빌드는 선택 사항입니다.

### UI·프런트엔드 작업

- 필수 자동 검사를 실행합니다.
- 데스크톱·모바일, 키보드 탐색, 콘솔 오류, 가로 넘침을 확인합니다.

### Supabase·Auth·Storage 작업

- 마이그레이션 파일과 실제 원격 스키마를 함께 확인합니다.
- RLS는 허용되어야 하는 요청과 거부되어야 하는 요청을 모두 실제로 검증합니다.
- 권한·Storage·함수 변경 뒤에는 Advisor 결과와 노출 키를 검토합니다.

### 배포 작업

- 로컬 품질 검사 뒤 Vercel 환경변수와 프로덕션 흐름을 확인합니다.
- sitemap, robots, metadata/OG URL 및 공개·비공개 콘텐츠 노출을 재검증합니다.

## 작업 완료 후

1. 작업 유형에 맞는 `docs/harness/QUALITY_GATES.md` 검증을 실행합니다.
2. Git diff에서 요청하지 않은 변경과 비밀값이 없는지 확인합니다.
3. `docs/development/DEVELOPMENT_REQUEST.md`에 실제 결과를 기록합니다.
4. `docs/development/DEVELOPMENT_LOG.md`에 작업 과정을 누적합니다.
5. 프로젝트 현황이 달라졌다면 `docs/harness/PROJECT_STATUS.md`를 갱신합니다.
