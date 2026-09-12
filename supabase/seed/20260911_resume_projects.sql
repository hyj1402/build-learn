-- 이력서의 프로젝트 경력을 공개 포트폴리오용 초기 데이터로 옮깁니다.
-- 개인정보(연락처, 주소, 생년월일)는 포함하지 않습니다.
-- 같은 SQL을 다시 실행해도 slug가 중복되지 않도록 ON CONFLICT DO NOTHING을 사용합니다.

insert into public.categories (name, slug, content_type, display_order)
values
  ('업무 시스템', 'app', 'project', 10),
  ('웹 서비스', 'web', 'project', 20)
on conflict (content_type, slug) do nothing;

insert into public.projects (
  slug, title, summary, body_text, category_id, publication_status, project_status,
  tech_stack, period_start, period_end, is_featured, author_id, published_at
)
values
  ('samsung-dream-scholarship-foundation-2025', '삼성꿈장학재단 시스템 개발', '장학사업 운영을 지원하는 재단 시스템 개발 프로젝트', '삼성꿈장학재단 시스템 개발 프로젝트입니다.\n\n재단의 장학사업 운영을 지원하는 시스템 개발 업무를 담당했습니다.', (select id from public.categories where content_type = 'project' and slug = 'app'), 'published', 'in_progress', array['Java', 'MySQL', 'Eclipse'], '2025.03', null, true, '6ec0a086-62f9-46f5-b4d9-c38f85b451a2', now()),
  ('b2b-large-data-solution-2024', 'B2B 대용량 데이터 처리 솔루션', '대용량 데이터를 처리하는 B2B 업무 시스템 개발 프로젝트', 'B2B 환경에서 대용량 데이터를 처리하는 업무 시스템 개발 프로젝트입니다.\n\n데이터 처리와 서비스 기능 개발 업무를 수행했습니다.', (select id from public.categories where content_type = 'project' and slug = 'app'), 'published', 'completed', array['Java', 'MongoDB', 'Linux', 'Windows', 'Eclipse'], '2024.01', '2025.02', true, '6ec0a086-62f9-46f5-b4d9-c38f85b451a2', now()),
  ('samsung-dream-scholarship-foundation-2023', '삼성꿈장학재단 시스템 개발', '장학사업 운영을 지원하는 재단 시스템 개발 프로젝트', '삼성꿈장학재단 시스템 개발 프로젝트입니다.\n\n재단의 장학사업 운영을 지원하는 시스템 개발 업무를 담당했습니다.', (select id from public.categories where content_type = 'project' and slug = 'app'), 'published', 'completed', array['Java', 'MySQL', 'Eclipse'], '2023.05', '2023.12', false, '6ec0a086-62f9-46f5-b4d9-c38f85b451a2', now()),
  ('shinhan-digital-counter-transition', '신한은행 디지털 창구 전환', '디지털 창구 전환과 테스트·유지보수를 수행한 금융 시스템 프로젝트', '신한은행 디지털 창구 전환 프로젝트입니다.\n\n전환 테스트와 유지보수 업무를 수행했습니다.', (select id from public.categories where content_type = 'project' and slug = 'app'), 'published', 'completed', array['Java', 'Oracle', 'Windows', 'Eclipse', 'WebSquare'], '2022.08', '2022.10', true, '6ec0a086-62f9-46f5-b4d9-c38f85b451a2', now()),
  ('tomato-retail-site-maintenance', '토마토 리테일 사이트 상시 개발', '공급사·업체 B2B 리테일 사이트의 상시 개발 프로젝트', '토마토 리테일 사이트 상시 개발 프로젝트입니다.\n\n공급사와 업체를 위한 B2B 사이트 개발 업무를 수행했습니다.', (select id from public.categories where content_type = 'project' and slug = 'web'), 'published', 'completed', array['Java', 'MariaDB', 'Windows', 'Eclipse'], '2022.01', '2022.07', false, '6ec0a086-62f9-46f5-b4d9-c38f85b451a2', now()),
  ('websquare-group-advancement', '웹스퀘어 그룹 고도화 및 유지보수', '그룹 시스템 고도화와 유지보수를 수행한 프로젝트', '웹스퀘어 그룹 시스템 고도화 및 유지보수 프로젝트입니다.\n\n기능 고도화와 유지보수 업무를 수행했습니다.', (select id from public.categories where content_type = 'project' and slug = 'app'), 'published', 'completed', array['Java', 'MariaDB', 'Windows', 'Eclipse', 'IntelliJ'], '2021.07', '2021.12', false, '6ec0a086-62f9-46f5-b4d9-c38f85b451a2', now()),
  ('lg-cns-nw-homepage', 'LG CNS NW 홈페이지 상시 개발', 'NW 홈페이지 프로그램 개발과 상시 운영 프로젝트', 'LG CNS NW 홈페이지 상시 개발 프로젝트입니다.\n\n홈페이지 프로그램 개발과 운영 업무를 수행했습니다.', (select id from public.categories where content_type = 'project' and slug = 'web'), 'published', 'completed', array['Java', 'Oracle', 'Windows', 'Eclipse'], '2021.02', '2021.06', false, '6ec0a086-62f9-46f5-b4d9-c38f85b451a2', now()),
  ('kt-antbot-homepage', 'KT AntBot 홈페이지 제작', 'RPA 홍보용 홈페이지 화면을 제작한 프로젝트', 'KT AntBot 홈페이지 제작 프로젝트입니다.\n\nRPA 홍보 홈페이지의 화면 제작 업무를 수행했습니다.', (select id from public.categories where content_type = 'project' and slug = 'web'), 'published', 'completed', array['C#', 'MariaDB', 'Windows', 'Eclipse'], '2020.09', '2020.12', false, '6ec0a086-62f9-46f5-b4d9-c38f85b451a2', now())
on conflict (slug) do nothing;
