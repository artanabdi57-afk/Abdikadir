-- Sahan core marketplace and learning model
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  headline text,
  is_creator boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  bio text,
  slug text unique,
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(user_id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  level text default 'all',
  status text not null default 'draft' check (status in ('draft','published','unpublished','archived')),
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  unique(course_id, position)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(user_id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  section_id uuid references public.course_sections(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  content_type text not null default 'video' check (content_type in ('video','article','audio','file','quiz','assignment','live')),
  content_url text,
  position integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','unpublished','archived')),
  is_standalone boolean not null default false,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  source text not null default 'free' check (source in ('free','order','admin')),
  created_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table if not exists public.lesson_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  source text not null default 'free' check (source in ('free','order','course','admin')),
  created_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  progress_percent numeric(5,2) not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(user_id, lesson_id)
);

alter table public.profiles enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_sections enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_access enable row level security;
alter table public.lesson_progress enable row level security;

create policy "profiles readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "creators readable" on public.creator_profiles for select using (true);
create policy "published courses readable" on public.courses for select using (status = 'published' or auth.uid() = creator_id);
create policy "creators manage own courses" on public.courses for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
create policy "course sections readable when course visible" on public.course_sections for select using (exists (select 1 from public.courses c where c.id = course_id and (c.status = 'published' or c.creator_id = auth.uid())));
create policy "creator manages own sections" on public.course_sections for all using (exists (select 1 from public.courses c where c.id = course_id and c.creator_id = auth.uid())) with check (exists (select 1 from public.courses c where c.id = course_id and c.creator_id = auth.uid()));
create policy "published lessons readable" on public.lessons for select using (status = 'published' or creator_id = auth.uid());
create policy "creator manages own lessons" on public.lessons for all using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "users view own enrollments" on public.enrollments for select using (user_id = auth.uid());
create policy "users view own lesson access" on public.lesson_access for select using (user_id = auth.uid());
create policy "users manage own progress" on public.lesson_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
