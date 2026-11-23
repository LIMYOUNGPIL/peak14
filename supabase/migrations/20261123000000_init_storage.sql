-- Peak14 저장소 구조 (DESIGN 4번, PLAN 3번)
--
-- 저장하는 것: 사용자 프로필(닉네임), 후기, 즐겨찾기, 외부 글 삭제 요청
-- 저장하지 않는 것: 산·루트·안전 유의사항 (코드 옆 데이터 파일에 직접 등록한다)
--
-- 접근 규칙(RLS)의 원칙
--  - 후기는 로그인한 사용자만 읽는다. (PRD 4번: 후기는 로그인 후에 보인다)
--  - 후기 작성은 본인 이름으로만 하고, AI 판정(sentiment)은 서버만 채운다.
--  - 즐겨찾기는 본인 것만 보고 만들고 지운다.
--  - 삭제 요청은 누구나 접수할 수 있지만, 읽는 것은 서버만 한다.
--  - 계정(auth.users)이 지워지면 프로필·후기·즐겨찾기도 함께 지워진다. (PRD 7번)

-- ---------------------------------------------------------------------------
-- 1. 사용자 프로필: 후기에 보여 줄 닉네임 (실명·이메일은 여기에 두지 않는다)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 2 and 20),
  created_at timestamptz not null default now()
);

-- 가입하면 닉네임을 임시로 만들어 준다. (이메일 앞부분을 쓰지 않는다)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, 'trekker-' || substr(replace(new.id::text, '-', ''), 1, 8));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. 후기: 앱 안에서 쓴 후기 + 외부 글 요약
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  route_id text not null,                       -- 데이터 파일의 루트 id
  origin text not null check (origin in ('app', 'external')),
  written_year integer not null check (written_year between 1990 and 2100),
  language text not null check (language in ('ko', 'en')),  -- 원문 언어
  -- AI 판정. null 이면 아직 판정 전("판정 중")
  sentiment text check (sentiment in ('positive', 'negative', 'neutral')),

  -- 앱 안 후기에만 있는 값
  author_id uuid references auth.users (id) on delete cascade,
  body text,                                    -- 작성자가 쓴 본문 (원문 그대로)
  rating integer check (rating between 1 and 5),  -- 별점. 판정 기준으로 쓰지 않는다

  -- 외부 글에만 있는 값 (원문 전체는 저장하지 않는다)
  summary_ko text,                              -- AI 요약 한국어판
  summary_en text,                              -- AI 요약 영어판
  author_name text,                             -- 글쓴이 표기 (프로필 정보는 저장하지 않는다)
  original_url text,                            -- 원문 링크
  link_checked_at date,                         -- 원문 링크를 마지막으로 확인한 날

  created_at timestamptz not null default now(),

  constraint reviews_app_fields check (
    origin <> 'app'
    or (author_id is not null and body is not null and rating is not null)
  ),
  constraint reviews_external_fields check (
    origin <> 'external'
    or (original_url is not null and (summary_ko is not null or summary_en is not null))
  )
);

create index reviews_route_idx on public.reviews (route_id, sentiment, written_year desc);
create index reviews_author_idx on public.reviews (author_id);

-- ---------------------------------------------------------------------------
-- 3. 즐겨찾기: 산 또는 루트를 저장 (route_id 가 null 이면 산 전체)
-- ---------------------------------------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mountain_slug text not null,
  route_id text,
  created_at timestamptz not null default now(),
  unique nulls not distinct (user_id, mountain_slug, route_id)
);

-- ---------------------------------------------------------------------------
-- 4. 외부 글 삭제 요청: 원문 글쓴이나 사이트 운영자가 보낸다
-- ---------------------------------------------------------------------------
create table public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews (id) on delete set null,  -- 처리 후에도 기록은 남긴다
  original_url text not null,                   -- 삭제를 요청한 원문 주소
  requester_type text not null check (requester_type in ('author', 'site-owner')),
  contact_email text,                           -- 처리 결과를 알릴 연락처 (선택)
  status text not null default 'received' check (status in ('received', 'done')),
  received_at date not null default current_date
);

-- ---------------------------------------------------------------------------
-- 5. 접근 규칙 (RLS): 켜 두면 아래 규칙에 없는 접근은 모두 막힌다
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.deletion_requests enable row level security;

-- 프로필: 닉네임은 후기와 함께 보여 줘야 하므로 로그인한 사용자가 읽는다. 수정은 본인만.
create policy "프로필은 로그인한 사용자가 읽는다"
  on public.profiles for select to authenticated using (true);
create policy "프로필은 본인만 고친다"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- 후기: 로그인한 사용자만 읽는다.
create policy "후기는 로그인한 사용자가 읽는다"
  on public.reviews for select to authenticated using (true);
-- 후기 작성: 본인 이름으로만, 앱 안 후기로만, AI 판정은 비워서 올린다.
create policy "후기는 본인 이름으로만 쓴다"
  on public.reviews for insert to authenticated
  with check (
    origin = 'app'
    and author_id = (select auth.uid())
    and sentiment is null
  );
-- 후기 삭제: 본인이 쓴 앱 안 후기만. (수정은 허용하지 않는다)
create policy "후기는 본인 것만 지운다"
  on public.reviews for delete to authenticated
  using (origin = 'app' and author_id = (select auth.uid()));

-- 즐겨찾기: 본인 것만 읽고, 만들고, 지운다.
create policy "즐겨찾기는 본인 것만 읽는다"
  on public.favorites for select to authenticated using (user_id = (select auth.uid()));
create policy "즐겨찾기는 본인 이름으로만 만든다"
  on public.favorites for insert to authenticated with check (user_id = (select auth.uid()));
create policy "즐겨찾기는 본인 것만 지운다"
  on public.favorites for delete to authenticated using (user_id = (select auth.uid()));

-- 삭제 요청: 누구나 접수할 수 있다. 처리 중 상태로만 올릴 수 있고, 읽는 것은 서버만 한다.
create policy "삭제 요청은 누구나 접수한다"
  on public.deletion_requests for insert to anon, authenticated
  with check (status = 'received' and review_id is null);
