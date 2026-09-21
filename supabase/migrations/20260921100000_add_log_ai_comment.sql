-- 관리자가 Claude에게 생성시킨 뒤 검토·수정해서 저장하는 "공개 AI 코멘트"를 Log에 붙입니다.
-- 별도 테이블 없이 logs 컬럼으로 두는 이유: 글 하나당 코멘트 하나이고, 공개 조회 정책(published만 읽기)을 그대로 따르기 때문입니다.
-- 쓰기는 기존 "admin full access logs" 정책이 관리자에게만 허용합니다.
alter table public.logs
  add column ai_comment text
    check (ai_comment is null or char_length(ai_comment) <= 3000),
  add column ai_comment_updated_at timestamptz;
