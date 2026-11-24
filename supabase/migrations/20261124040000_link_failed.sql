-- 원문 링크가 열리지 않은 날 (PRD 예외 상황 3: "원문을 확인할 수 없습니다" 표시용). 열리면 비운다.
alter table public.reviews add column if not exists link_failed_at date;
