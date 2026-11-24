-- 삭제 요청에 요청 사유(선택)를 적을 칸을 추가한다 (PLAN 14번)
alter table public.deletion_requests
  add column if not exists note text
    check (note is null or char_length(note) <= 1000);
