-- Contact 폼으로 들어온 문의를 보관하는 테이블입니다.
-- 이메일 발송에 의존하면 스팸함에 빠지거나 발송이 실패했을 때 문의가 그대로 사라지므로,
-- 문의 원본은 항상 DB에 남기고 이메일 알림은 나중에 선택적으로 얹습니다.
create table if not exists "public"."contact_messages" (
  id uuid primary key default gen_random_uuid(),
  -- 길이 제한을 DB에도 두는 이유: 공개된 anon 키로 REST API에 직접 요청하면 폼의 검증을 건너뛸 수 있어
  -- 최후의 방어선은 DB 제약이어야 합니다.
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (
    char_length(email) between 3 and 200
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  message text not null check (char_length(message) between 1 and 5000),
  -- 관리자가 확인한 문의를 구분하기 위한 값입니다.
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table "public"."contact_messages" enable row level security;

-- 방문자는 문의를 "남기는 것"만 할 수 있습니다. SELECT 정책이 없으므로 남이 쓴 문의를 읽을 수 없습니다.
create policy "anyone can submit contact message"
  on "public"."contact_messages" for insert
  to anon, authenticated
  with check (true);

-- 조회·읽음 처리·삭제는 소유자(관리자)만 가능합니다.
create policy "admin manages contact messages"
  on "public"."contact_messages" for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
