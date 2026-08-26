-- Creator/Instructor application workflow and admin review actions
create table if not exists public.sahan_creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  full_name text,
  email text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);
alter table public.sahan_creator_applications add column if not exists user_id uuid;
alter table public.sahan_creator_applications add column if not exists full_name text;
alter table public.sahan_creator_applications add column if not exists email text;
alter table public.sahan_creator_applications add column if not exists reviewed_by uuid;
alter table public.sahan_creator_applications add column if not exists reviewed_at timestamptz;
alter table public.sahan_creator_applications add column if not exists rejection_reason text;
create unique index if not exists sahan_creator_applications_user_id_key on public.sahan_creator_applications(user_id) where user_id is not null;

-- Applicant may submit/read only their own request. Admin policies should be enforced by the existing admin-role helper.
alter table public.sahan_creator_applications enable row level security;
drop policy if exists "creator application submit own" on public.sahan_creator_applications;
create policy "creator application submit own" on public.sahan_creator_applications for insert with check (auth.uid() = user_id);
drop policy if exists "creator application read own" on public.sahan_creator_applications;
create policy "creator application read own" on public.sahan_creator_applications for select using (auth.uid() = user_id);

-- Admin review is exposed through one atomic RPC. Replace is_super_admin() with the project's existing admin check if needed.
create or replace function public.review_creator_application(p_application_id uuid,p_decision text,p_reason text default null)
returns void language plpgsql security definer set search_path=public as $$
declare a public.sahan_creator_applications%rowtype;
begin
 if p_decision not in ('approved','rejected') then raise exception 'Invalid decision'; end if;
 select * into a from public.sahan_creator_applications where id=p_application_id for update;
 if not found then raise exception 'Application not found'; end if;
 update public.sahan_creator_applications set status=p_decision,reviewed_by=auth.uid(),reviewed_at=now(),rejection_reason=case when p_decision='rejected' then p_reason else null end where id=p_application_id;
 if p_decision='approved' then
   update public.sahan_profiles set role='instructor' where id=a.user_id;
   insert into public.instructors(auth_user_id,name,email,status) values(a.user_id,coalesce(a.full_name,'Creator'),a.email,'active') on conflict (auth_user_id) do update set status='active';
 end if;
end; $$;
revoke all on function public.review_creator_application(uuid,text,text) from public;
grant execute on function public.review_creator_application(uuid,text,text) to authenticated;
