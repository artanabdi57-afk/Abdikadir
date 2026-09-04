-- Keep every Sahan admin read/write policy on the same canonical RBAC table.
-- This prevents the admin control center from depending on the legacy admins table.

create or replace function public.is_sahan_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.sahan_admin_users au
    where au.auth_user_id=auth.uid() and au.is_active=true
  );
$$;

drop policy if exists sahan_admin_profiles_read on public.sahan_profiles;
create policy sahan_admin_profiles_read on public.sahan_profiles for select to authenticated using (public.is_sahan_admin());

drop policy if exists sahan_admin_instructors_read on public.instructors;
create policy sahan_admin_instructors_read on public.instructors for select to authenticated using (public.is_sahan_admin());

drop policy if exists sahan_admin_enrollments_read on public.sahan_enrollments;
create policy sahan_admin_enrollments_read on public.sahan_enrollments for select to authenticated using (public.is_sahan_admin());

drop policy if exists sahan_admin_orders_read on public.sahan_orders;
create policy sahan_admin_orders_read on public.sahan_orders for select to authenticated using (public.is_sahan_admin());

drop policy if exists "course reviews admin read" on public.sahan_course_reviews;
create policy course_reviews_admin_read on public.sahan_course_reviews for select to authenticated using (public.is_sahan_admin());

drop policy if exists sahan_admin_applications_read on public.sahan_creator_applications;
create policy sahan_admin_applications_read on public.sahan_creator_applications for select to authenticated using (public.is_sahan_admin());

drop policy if exists sahan_admin_applications_update on public.sahan_creator_applications;
create policy sahan_admin_applications_update on public.sahan_creator_applications for update to authenticated using (public.is_sahan_admin()) with check (public.is_sahan_admin());

drop policy if exists sahan_courses_public_select on public.sahan_courses;
create policy sahan_courses_public_select on public.sahan_courses for select to anon,authenticated using (((status='published' and admin_approved=true) or creator_id=auth.uid() or public.is_sahan_admin()));

drop policy if exists sahan_courses_creator_update on public.sahan_courses;
create policy sahan_courses_creator_update on public.sahan_courses for update to authenticated using (creator_id=auth.uid() or public.is_sahan_admin()) with check (creator_id=auth.uid() or public.is_sahan_admin());

drop policy if exists sahan_courses_creator_delete on public.sahan_courses;
create policy sahan_courses_creator_delete on public.sahan_courses for delete to authenticated using (creator_id=auth.uid() or public.is_sahan_admin());

update public.sahan_admin_users
set role='super_admin', is_active=true, updated_at=now()
where auth_user_id=(select id from auth.users where lower(email)='artanabdi57@gmail.com' limit 1);
