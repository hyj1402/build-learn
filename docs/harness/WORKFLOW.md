# 작업 절차

## 작업 시작 전

1. `AGENTS.md`와 이 문서를 읽습니다.
2. `docs/harness/PROJECT_STATUS.md`에서 현재 구현 범위를 확인합니다.
3. `docs/development/DEVELOPMENT_REQUEST.md`에 요청 배경, 변경 범위, 완료 조건을 기록합니다.
4. 관련 코드와 문서를 먼저 조사한 뒤 변경합니다.

## 구현 중

- 요청 범위를 벗어난 기능을 임의로 추가하지 않습니다.
- 새 기능과 데이터 흐름에는 `docs/guides/CODE_COMMENT_GUIDE.md`에 맞는 한국어 주석을 작성합니다.
- 사용자에게 보이는 동작이 바뀌면 관련 MDX 콘텐츠와 학습 문서도 확인합니다.
- 비밀값은 저장소에 커밋하지 않고 필요할 때 `.env.example`에 변수 이름만 기록합니다.

## 작업 완료 후

1. `docs/harness/QUALITY_GATES.md`의 검증 명령을 실행합니다.
2. Git diff에서 요청하지 않은 변경과 비밀값이 없는지 확인합니다.
3. `docs/development/DEVELOPMENT_REQUEST.md`에 실제 결과를 기록합니다.
4. `docs/development/DEVELOPMENT_LOG.md`에 작업 과정을 누적합니다.
5. 프로젝트 현황이 달라졌다면 `docs/harness/PROJECT_STATUS.md`를 갱신합니다.
