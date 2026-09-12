-- 어떤 기사가 어떤 다이제스트 Log 글로 묶였는지 추적하기 위한 참조입니다.
alter table "public"."tech_articles"
  add column if not exists digest_log_id uuid references "public"."logs" (id) on delete set null;

create index if not exists tech_articles_digest_log_id_idx on "public"."tech_articles" (digest_log_id);
