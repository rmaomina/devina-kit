-- =============================================
-- devina-kit Supabase 테이블 설정
-- Supabase Dashboard → SQL Editor에서 실행
-- =============================================

-- 1. 유저 프로필 (SSO 로그인 시 자동 생성)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  provider text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Anyone can read profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- 신규 유저 가입 시 자동으로 profiles 행 생성하는 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    new.raw_app_meta_data->>'provider'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. 유저별 즐겨찾기
create table public.user_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tool_id text not null,
  created_at timestamptz default now()
);

alter table public.user_favorites
  add constraint user_favorites_unique unique (user_id, tool_id);

alter table public.user_favorites enable row level security;

create policy "Users can read own favorites"
  on public.user_favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.user_favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.user_favorites for delete
  using (auth.uid() = user_id);

-- 3. JIRA 설정 기억하기
create table public.user_jira_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  domain text not null,
  email text not null,
  token text not null,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_jira_settings enable row level security;

create policy "Users can read own jira settings"
  on public.user_jira_settings for select
  using (auth.uid() = user_id);

create policy "Users can upsert own jira settings"
  on public.user_jira_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own jira settings"
  on public.user_jira_settings for update
  using (auth.uid() = user_id);

create policy "Users can delete own jira settings"
  on public.user_jira_settings for delete
  using (auth.uid() = user_id);
