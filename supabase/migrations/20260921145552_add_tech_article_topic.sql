-- 수집 상태(new/drafted/dismissed)와 별도로, 글의 성격을 분류해 다이제스트 대상을 고릅니다.
-- 기존 글은 삭제하거나 임의의 기술 글로 오인하지 않도록 review(검토 필요)로 안전하게 시작합니다.
alter table "public"."tech_articles"
  add column if not exists topic text not null default 'review'
  check (topic in ('ai_development', 'product', 'company', 'review'));

create index if not exists tech_articles_topic_idx on "public"."tech_articles" (topic);

comment on column "public"."tech_articles"."topic" is
  'ai_development: 개발·AI 기술 / product: 제품 소식 / company: 회사·정책·협업 / review: 검토 필요';
