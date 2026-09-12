-- 스키마/RLS 재검증 과정에서 목록 조회에 쓰이는 컬럼(publication_status, category_id, author_id)에
-- 인덱스가 없는 것을 발견해 추가합니다. 데이터가 늘어났을 때 공개 글 목록 조회와
-- 카테고리/작성자 필터가 테이블 전체를 스캔하지 않도록 하기 위함입니다.

create index if not exists projects_publication_status_idx on "public"."projects" (publication_status);
create index if not exists projects_category_id_idx on "public"."projects" (category_id);
create index if not exists projects_author_id_idx on "public"."projects" (author_id);

create index if not exists logs_publication_status_idx on "public"."logs" (publication_status);
create index if not exists logs_category_id_idx on "public"."logs" (category_id);
create index if not exists logs_author_id_idx on "public"."logs" (author_id);
