-- 즐겨찾기도 후기와 같은 방식으로 정리한다 (PLAN 16번)
--  - 사용자가 저장소에 직접 쓰는 길을 닫고, 서버 동작이 로그인 확인·검증 후 서버 권한으로만 저장한다.
--  - 서버가 틀리더라도 저장소가 마지막으로 막도록 형식 검사와 1인당 100개 제한을 건다.

drop policy if exists "즐겨찾기는 본인 이름으로만 만든다" on public.favorites;
drop policy if exists "즐겨찾기는 본인 것만 지운다" on public.favorites;
revoke insert, update, delete on public.favorites from anon, authenticated;
-- (읽기 규칙 "즐겨찾기는 본인 것만 읽는다"는 그대로 둔다.)

alter table public.favorites
  add constraint favorites_slug_shape check (mountain_slug ~ '^[a-z0-9-]{1,80}$'),
  add constraint favorites_route_shape check (route_id is null or route_id ~ '^[a-z0-9-]{1,80}$');

create or replace function public.favorites_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));
  if (select count(*) from public.favorites f where f.user_id = new.user_id) >= 100 then
    raise exception 'favorites_limit' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger favorites_guard_trg
  before insert on public.favorites
  for each row execute function public.favorites_guard();
