-- 쓰기 길 정리 (공개 전 보안 점검 1·3번)
--
-- 문제: 로그인한 사용자가 우리 서버를 거치지 않고 저장소에 직접 후기를 넣으면
--       욕설·개인정보 거르기, 글자 수·하루 5개 제한, 연도 검사를 모두 건너뛸 수 있었다.
--       삭제 요청은 로그인 없이 누구나 무제한으로 넣을 수 있었고, 닉네임도 직접 바꿀 수 있었다.
-- 해결: (1) 사용자가 직접 쓰는 길을 닫고 "서버가 검사한 뒤 서버 권한으로만" 저장한다.
--       (2) 서버 코드가 틀리더라도 저장소가 마지막으로 막도록 제한을 저장소 안에도 건다.

-- ---------------------------------------------------------------------------
-- 1. 사용자가 직접 쓰는 길 닫기
-- ---------------------------------------------------------------------------
drop policy if exists "후기는 본인 이름으로만 쓴다" on public.reviews;
drop policy if exists "프로필은 본인만 고친다" on public.profiles;
drop policy if exists "삭제 요청은 누구나 접수한다" on public.deletion_requests;

-- 규칙이 없으면 이미 막히지만, 권한 자체도 거두어 이중으로 막는다.
revoke insert, update on public.reviews from anon, authenticated;
revoke insert, update on public.profiles from anon, authenticated;
revoke all on public.deletion_requests from anon, authenticated;
-- (후기 읽기·본인 후기 삭제, 즐겨찾기, 프로필 읽기 규칙은 그대로 둔다.)

-- ---------------------------------------------------------------------------
-- 2. 저장소 안의 제한 (서버가 관리자 권한으로 저장할 때도 적용된다)
-- ---------------------------------------------------------------------------
alter table public.reviews
  add constraint reviews_body_length
    check (body is null or char_length(body) between 1 and 1000),
  add constraint reviews_summary_length
    check ((summary_ko is null or char_length(summary_ko) <= 2000)
       and (summary_en is null or char_length(summary_en) <= 2000)),
  add constraint reviews_author_name_length
    check (author_name is null or char_length(author_name) <= 100),
  -- 원문 링크는 https 주소만. (javascript: 같은 주소를 막는다)
  add constraint reviews_original_url_https
    check (original_url is null or (char_length(original_url) <= 2000 and original_url ~ '^https://[^[:space:]]+$')),
  -- 앱 안 후기는 외부 글 전용 칸을 쓸 수 없다. (사칭·가짜 링크 방지)
  add constraint reviews_app_has_no_external
    check (origin <> 'app' or (original_url is null and author_name is null
       and summary_ko is null and summary_en is null and link_checked_at is null));

alter table public.deletion_requests
  add constraint deletion_requests_url_https
    check (char_length(original_url) <= 2000 and original_url ~ '^https://[^[:space:]]+$'),
  add constraint deletion_requests_email_shape
    check (contact_email is null or (char_length(contact_email) <= 254
       and contact_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'));

-- 후기 저장 직전 검사: 미래 연도 거부, 앱 안 후기의 하루 5개 제한
-- (같은 사용자의 동시 요청이 5개를 넘기지 못하도록 사용자별로 순서를 세운다)
create or replace function public.reviews_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.written_year > extract(year from now() at time zone 'utc')::int then
    raise exception 'review_year_in_future' using errcode = 'check_violation';
  end if;

  if new.origin = 'app' then
    perform pg_advisory_xact_lock(hashtext(new.author_id::text));
    if (
      select count(*) from public.reviews r
      where r.author_id = new.author_id and r.created_at > now() - interval '24 hours'
    ) >= 5 then
      raise exception 'review_daily_limit' using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

create trigger reviews_guard_trg
  before insert on public.reviews
  for each row execute function public.reviews_guard();
