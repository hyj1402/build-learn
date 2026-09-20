-- 공개 Log 탭(dev/ai/life/etc)과 관리자 작성 폼이 같은 카테고리 행을 참조하도록 기본값을 보장합니다.
-- 이미 같은 slug가 있으면 이름을 덮어쓰지 않고, 비활성화된 기본 카테고리만 다시 활성화합니다.
insert into public.categories (name, slug, content_type, display_order, is_active)
values
  ('개발', 'dev', 'log', 10, true),
  ('AI 활용', 'ai', 'log', 20, true),
  ('회고', 'life', 'log', 30, true),
  ('기타', 'etc', 'log', 40, true)
on conflict (content_type, slug) do update
  set is_active = true,
      display_order = excluded.display_order;
