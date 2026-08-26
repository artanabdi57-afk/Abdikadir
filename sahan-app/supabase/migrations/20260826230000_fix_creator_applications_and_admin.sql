-- Canonical Sahan creator-application/admin workflow.
-- This migration is defensive because an older root migration may already have created legacy columns.

-- The live profile role constraint must support the roles used by the review workflow.
alter table public.sahan_profiles drop constraint if exists sahan_profiles_role_check;
alter table public.sahan_profiles add constraint sahan_profiles_role_check check(role in('learner','creator','admin','super_admin','instructor','sales_admin'));

alter table public.sahan_creator_applications add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.sahan_creator_applications add column if not exists full_name text;
alter table public.sahan_creator_applications add column if not exists email text;
alter table public.sahan_creator_applications add column if not exists teaching_topic text;
alter table public.sahan_creator_applications add column if not exists expertise text;
alter table public.sahan_creator_applications add column if not exists experience text;
alter table public.sahan_creator_applications add column if not exists status text not null default 'pending';
alter table public.sahan_creator_applications add column if not exists reviewed_by uuid references auth.users(id);
alter table public.sahan_creator_applications add column if not exists reviewed_at timestamptz;
alter table public.sahan_creator_applications add column if not exists rejection_reason text;
alter table public.sahan_creator_applications add column if not exists created_at timestamptz not null default now();
alter table public.sahan_creator_applications add column if not exists updated_at timestamptz not null default now();

update public.sahan_creator_applications set full_name=coalesce(full_name,name) where full_name is null;
update public.sahan_creator_applications set teaching_topic=coalesce(teaching_topic,expertise) where teaching_topic is null;
update public.sahan_creator_applications set experience=coalesce(experience,bio) where experience is null;

create unique index if not exists sahan_creator_applications_user_id_unique on public.sahan_creator_applications(user_id) where user_id is not null;
alter table public.sahan_creator_applications enable row level security;

drop policy if exists "creator application submit own" on public.sahan_creator_applications;
create policy "creator application submit own" on public.sahan_creator_applications for insert to authenticated with check(auth.uid()=user_id);

drop policy if exists "creator application read own" on public.sahan_creator_applications;
create policy "creator application read own" on public.sahan_creator_applications for select to authenticated using(auth.uid()=user_id);

create table if not exists public.sahan_admin_users(
 id uuid primary key default gen_random_uuid(),
 auth_user_id uuid not null unique references auth.users(id) on delete cascade,
 role text not null check(role in('super_admin','support_admin','sales_admin','financial_admin','read_only')),
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.sahan_admin_users enable row level security;
drop policy if exists "admin users read own" on public.sahan_admin_users;
create policy "admin users read own" on public.sahan_admin_users for select to authenticated using(auth.uid()=auth_user_id);

-- Canonical admin account. The auth user id was resolved from auth.users for artanabdi57@gmail.com.
insert into public.sahan_admin_users(auth_user_id,role,is_active)
values('8a8061ae-7ae3-46a1-95e2-bc5905a57c44','super_admin',true)
on conflict(auth_user_id) do update set role='super_admin',is_active=true;

update public.sahan_profiles set role='super_admin' where id='8a8061ae-7ae3-46a1-95e2-bc5905a57c44';

-- Admins need to see pending applications. Learners retain own-row access.
drop policy if exists "creator application admin read" on public.sahan_creator_applications;
create policy "creator application admin read" on public.sahan_creator_applications for select to authenticated
using (exists (select 1 from public.sahan_admin_users au where au.auth_user_id=auth.uid() and au.is_active=true and au.role in('super_admin','sales_admin')));

-- Approve/reject remains the existing AdminDashboard contract, but authorization is aligned with sahan_admin_users.
create or replace function public.review_creator_application(p_application_id uuid,p_decision text,p_reason text default null)
returns void language plpgsql security definer set search_path=public as $$
declare a public.sahan_creator_applications%rowtype; reviewer_role text; admin_active boolean;
begin
 select role,is_active into reviewer_role,admin_active from public.sahan_admin_users where auth_user_id=auth.uid();
 if not coalesce(admin_active,false) or reviewer_role not in('super_admin','sales_admin') then raise exception 'You are not allowed to review creator applications'; end if;
 if p_decision not in('approved','rejected') then raise exception 'Invalid decision'; end if;
 select * into a from public.sahan_creator_applications where id=p_application_id for update;
 if not found then raise exception 'Application not found'; end if;
 if a.status<>'pending' then raise exception 'This application has already been reviewed'; end if;
 update public.sahan_creator_applications set status=p_decision,reviewed_by=auth.uid(),reviewed_at=now(),rejection_reason=case when p_decision='rejected' then p_reason else null end,updated_at=now() where id=p_application_id;
 if p_decision='approved' then
  update public.sahan_profiles set role='instructor' where id=a.user_id;
  insert into public.instructors(auth_user_id,name,email,status) values(a.user_id,coalesce(a.full_name,a.name,'Creator'),a.email,'active') on conflict(auth_user_id) do update set status='active';
 end if;
end;$$;
revoke all on function public.review_creator_application(uuid,text,text) from public;
grant execute on function public.review_creator_application(uuid,text,text) to authenticated;
