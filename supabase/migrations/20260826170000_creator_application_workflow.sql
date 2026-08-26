create table if not exists public.sahan_creator_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  teaching_topic text not null,
  bio text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by_admin_id uuid references public.admins(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_sahan_creator_applications_status on public.sahan_creator_applications(status, created_at desc);

alter table public.sahan_creator_applications enable row level security;
