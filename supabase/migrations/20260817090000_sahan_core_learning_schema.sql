-- Phase 1 base schema. This timestamp intentionally precedes the existing teach-portal
-- migration because that migration ALTERs public.sahan_courses.
create extension if not exists pgcrypto;

create table if not exists public.sahan_courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_url text,
  category text,
  level text not null default 'All levels',
  price numeric not null default 0 check (price >= 0),
  currency text not null default 'USD',
  is_free boolean not null default false,
  status text not null default 'draft' check (status in ('draft','pending_review','published','archived')),
  admin_approved boolean not null default false,
  instructor_id uuid,
  base_quality_score numeric not null default 0,
  rank_score numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((is_free = true and price = 0) or is_free = false)
);

create table if not exists public.sahan_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.sahan_courses(id) on delete cascade,
  title text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_id, position)
);

create table if not exists public.sahan_lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sahan_sections(id) on delete cascade,
  title text not null,
  type text not null check (type in ('video','article','quiz','assignment','file')),
  content_url text,
  content jsonb not null default '{}'::jsonb,
  duration integer check (duration is null or duration >= 0),
  position integer not null default 0 check (position >= 0),
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(section_id, position)
);

create table if not exists public.sahan_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  locale text default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sahan_enrollments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.sahan_courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','cancelled','refunded')),
  enrolled_at timestamptz not null default now(),
  unique(learner_id, course_id)
);

create table if not exists public.sahan_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.sahan_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(learner_id, lesson_id)
);

create table if not exists public.sahan_orders (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.sahan_courses(id) on delete restrict,
  amount numeric not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','paid','completed','failed','cancelled','refunded')),
  payment_provider text,
  payment_reference text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sahan_certificate_templates (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null unique references public.sahan_courses(id) on delete cascade,
  instructor_id uuid,
  title text not null default 'Certificate of Completion',
  issuer_name text not null,
  issuer_title text,
  logo_url text,
  signature_url text,
  body_text text not null,
  eligibility_progress numeric not null default 100 check (eligibility_progress between 0 and 100),
  auto_issue boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sahan_certificates (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.sahan_courses(id) on delete cascade,
  instructor_id uuid,
  learner_id uuid not null references auth.users(id) on delete cascade,
  learner_name text not null,
  certificate_no text not null unique,
  issued_at timestamptz not null default now(),
  verified boolean not null default true,
  unique(course_id, learner_id)
);

create table if not exists public.sahan_reviews (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.sahan_courses(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(learner_id, course_id)
);

create index if not exists idx_sahan_courses_public on public.sahan_courses(status, admin_approved, rank_score desc);
create index if not exists idx_sahan_sections_course on public.sahan_sections(course_id, position);
create index if not exists idx_sahan_lessons_section on public.sahan_lessons(section_id, position);
create index if not exists idx_sahan_enrollments_learner on public.sahan_enrollments(learner_id, status);
create index if not exists idx_sahan_progress_learner on public.sahan_lesson_progress(learner_id);
create index if not exists idx_sahan_orders_learner on public.sahan_orders(learner_id, created_at desc);
create index if not exists idx_sahan_reviews_course on public.sahan_reviews(course_id, created_at desc);

alter table public.sahan_courses enable row level security;
alter table public.sahan_sections enable row level security;
alter table public.sahan_lessons enable row level security;
alter table public.sahan_profiles enable row level security;
alter table public.sahan_enrollments enable row level security;
alter table public.sahan_lesson_progress enable row level security;
alter table public.sahan_orders enable row level security;
alter table public.sahan_certificate_templates enable row level security;
alter table public.sahan_certificates enable row level security;
alter table public.sahan_reviews enable row level security;

create policy "public can read approved published courses" on public.sahan_courses for select to public using (admin_approved = true and status = 'published');
create policy "public can read content of approved published courses" on public.sahan_sections for select to public using (exists (select 1 from public.sahan_courses c where c.id = course_id and c.admin_approved = true and c.status = 'published'));
create policy "public can read preview or published lessons" on public.sahan_lessons for select to public using (is_preview = true or exists (select 1 from public.sahan_sections s join public.sahan_courses c on c.id = s.course_id where s.id = section_id and c.admin_approved = true and c.status = 'published'));
create policy "learners manage own profile" on public.sahan_profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "learners read own enrollments" on public.sahan_enrollments for select to authenticated using (learner_id = auth.uid());
create policy "learners read own progress" on public.sahan_lesson_progress for select to authenticated using (learner_id = auth.uid());
create policy "learners update own progress" on public.sahan_lesson_progress for insert to authenticated with check (learner_id = auth.uid());
create policy "learners can remove own progress" on public.sahan_lesson_progress for delete to authenticated using (learner_id = auth.uid());
create policy "learners read own orders" on public.sahan_orders for select to authenticated using (learner_id = auth.uid());
create policy "learners read own certificates" on public.sahan_certificates for select to authenticated using (learner_id = auth.uid());
create policy "certificate numbers are publicly verifiable" on public.sahan_certificates for select to public using (verified = true);
create policy "public can read course reviews" on public.sahan_reviews for select to public using (true);
create policy "learners create own reviews for enrolled courses" on public.sahan_reviews for insert to authenticated with check (learner_id = auth.uid() and exists (select 1 from public.sahan_enrollments e where e.learner_id = auth.uid() and e.course_id = sahan_reviews.course_id and e.status in ('active','completed')));
create policy "learners update own reviews" on public.sahan_reviews for update to authenticated using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy "learners delete own reviews" on public.sahan_reviews for delete to authenticated using (learner_id = auth.uid());

create or replace function public.set_sahan_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger sahan_courses_updated_at before update on public.sahan_courses for each row execute function public.set_sahan_updated_at();
create trigger sahan_sections_updated_at before update on public.sahan_sections for each row execute function public.set_sahan_updated_at();
create trigger sahan_lessons_updated_at before update on public.sahan_lessons for each row execute function public.set_sahan_updated_at();
create trigger sahan_profiles_updated_at before update on public.sahan_profiles for each row execute function public.set_sahan_updated_at();
create trigger sahan_orders_updated_at before update on public.sahan_orders for each row execute function public.set_sahan_updated_at();
create trigger sahan_certificate_templates_updated_at before update on public.sahan_certificate_templates for each row execute function public.set_sahan_updated_at();
create trigger sahan_reviews_updated_at before update on public.sahan_reviews for each row execute function public.set_sahan_updated_at();
