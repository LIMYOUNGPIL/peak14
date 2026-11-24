-- 외부 글(위키보야지 요약 등)의 라이선스 표시와 중복 방지 (PLAN 13번)
--
-- CC BY-SA 같은 라이선스는 "출처 표기 + 같은 라이선스로 공개"를 요구한다.
-- 그래서 외부 글마다 라이선스 이름을 함께 저장해 화면에 보여 준다.

alter table public.reviews
  add column if not exists license text
    check (license is null or char_length(license) <= 100);

-- 같은 루트에 같은 원문 주소의 외부 글을 두 번 넣지 못하게 한다.
create unique index if not exists reviews_external_unique_url
  on public.reviews (route_id, original_url)
  where origin = 'external';
