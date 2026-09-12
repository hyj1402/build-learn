-- Log 태그를 문자열 배열이 아닌 관리 가능한 마스터 데이터 + 연결 테이블로 분리합니다.
-- logs.tags는 기존 배포와 과거 데이터를 안전하게 유지하기 위한 호환용 값이며,
-- 이후 새 글/수정은 tags와 log_tags를 기준으로 작성됩니다.

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index tags_name_lower_unique on public.tags (lower(name));

create table public.log_tags (
  log_id uuid not null references public.logs(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (log_id, tag_id)
);

create index log_tags_tag_id_log_id_idx on public.log_tags (tag_id, log_id);

-- 기존 logs.tags 배열을 한 번만 태그 마스터와 연결 데이터로 옮깁니다.
insert into public.tags (name, slug)
select distinct
  trimmed_tag,
  trim(both '-' from lower(regexp_replace(trimmed_tag, '[^0-9A-Za-z가-힣]+', '-', 'g')))
from public.logs
cross join lateral unnest(public.logs.tags) as raw_tag
cross join lateral (select btrim(raw_tag) as trimmed_tag) as normalized
where trimmed_tag <> ''
on conflict (slug) do nothing;

insert into public.log_tags (log_id, tag_id)
select distinct logs.id, tags.id
from public.logs
cross join lateral unnest(logs.tags) as raw_tag
join public.tags on lower(tags.name) = lower(btrim(raw_tag))
where btrim(raw_tag) <> ''
on conflict do nothing;

alter table public.tags enable row level security;
alter table public.log_tags enable row level security;

-- 방문자는 활성화된 태그만 필터 메뉴에서 읽을 수 있습니다.
create policy "public read active tags"
  on public.tags for select
  to anon, authenticated
  using (is_active = true);

-- 방문자는 공개된 Log에 연결된 태그 관계만 읽을 수 있습니다.
create policy "public read published log tag links"
  on public.log_tags for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.logs
      where logs.id = log_tags.log_id
        and logs.publication_status = 'published'
    )
  );

-- 관리자 UUID만 태그와 연결 관계를 생성·변경·삭제할 수 있습니다.
create policy "admin full access tags"
  on public.tags for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin full access log tags"
  on public.log_tags for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
