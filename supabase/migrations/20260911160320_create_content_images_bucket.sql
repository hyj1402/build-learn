-- 공개 콘텐츠 이미지는 URL로 제공하되, 파일 변경은 관리자 UUID만 할 수 있게 둡니다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "admin manage content images"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'content-images'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'content-images'
    and (select public.is_admin())
  );
