-- Phase 1 follow-up. Runs after the teach portal migration so instructor/admin
-- foreign keys and policies can safely reference the established tables.

alter table public.sahan_certificate_templates drop constraint if exists sahan_certificate_templates_instructor_id_fkey;
alter table public.sahan_certificate_templates add constraint sahan_certificate_templates_instructor_id_fkey foreign key (instructor_id) references public.instructors(id) on delete set null;
alter table public.sahan_certificates drop constraint if exists sahan_certificates_instructor_id_fkey;
alter table public.sahan_certificates add constraint sahan_certificates_instructor_id_fkey foreign key (instructor_id) references public.instructors(id) on delete set null;

-- Do not expose learner certificate records through the generic table endpoint.
drop policy if exists "certificate numbers are publicly verifiable" on public.sahan_certificates;

create policy "instructors insert own courses" on public.sahan_courses for insert to authenticated with check (instructor_id in (select id from public.instructors where auth_user_id = auth.uid()) or public.is_sahan_admin());
create policy "instructors delete own draft courses" on public.sahan_courses for delete to authenticated using (instructor_id in (select id from public.instructors where auth_user_id = auth.uid()) or public.is_sahan_admin());

create policy "instructors and admins manage course sections" on public.sahan_sections for all to authenticated using (
  exists (select 1 from public.sahan_courses c where c.id = course_id and (c.instructor_id in (select id from public.instructors where auth_user_id = auth.uid()) or public.is_sahan_admin()))
) with check (
  exists (select 1 from public.sahan_courses c where c.id = course_id and (c.instructor_id in (select id from public.instructors where auth_user_id = auth.uid()) or public.is_sahan_admin()))
);

create policy "instructors and admins manage lessons" on public.sahan_lessons for all to authenticated using (
  exists (select 1 from public.sahan_sections s join public.sahan_courses c on c.id = s.course_id where s.id = section_id and (c.instructor_id in (select id from public.instructors where auth_user_id = auth.uid()) or public.is_sahan_admin()))
) with check (
  exists (select 1 from public.sahan_sections s join public.sahan_courses c on c.id = s.course_id where s.id = section_id and (c.instructor_id in (select id from public.instructors where auth_user_id = auth.uid()) or public.is_sahan_admin()))
);

create policy "instructors manage own certificate templates" on public.sahan_certificate_templates for all to authenticated using (
  instructor_id in (select id from public.instructors where auth_user_id = auth.uid()) or public.is_sahan_admin()
) with check (
  instructor_id in (select id from public.instructors where auth_user_id = auth.uid()) or public.is_sahan_admin()
);
create policy "instructors and admins read course certificates" on public.sahan_certificates for select to authenticated using (
  learner_id = auth.uid() or instructor_id in (select id from public.instructors where auth_user_id = auth.uid()) or public.is_sahan_admin()
);
create policy "admins manage orders" on public.sahan_orders for all to authenticated using (public.is_sahan_admin()) with check (public.is_sahan_admin());
create policy "admins manage enrollments" on public.sahan_enrollments for all to authenticated using (public.is_sahan_admin()) with check (public.is_sahan_admin());

create or replace function public.get_sahan_course_rankings()
returns table(
  id uuid,
  instructor_id uuid,
  title text,
  slug text,
  description text,
  cover_url text,
  category text,
  level text,
  price numeric,
  currency text,
  base_quality_score numeric,
  manual_score numeric,
  promotion_score numeric,
  effective_rank_score numeric
)
language sql stable security invoker set search_path = public
as $$
  select * from public.get_course_rankings();
$$;

create or replace function public.issue_sahan_certificate(
  p_course_id uuid,
  p_instructor_id uuid,
  p_learner_id uuid,
  p_learner_name text
)
returns public.sahan_certificates
language plpgsql security definer set search_path = public
as $$
declare
  v_certificate public.sahan_certificates;
  v_no text;
begin
  if not exists (
    select 1 from public.sahan_courses
    where id = p_course_id and instructor_id = p_instructor_id
  ) then
    raise exception 'Instructor does not own this course';
  end if;

  if not exists (
    select 1 from public.sahan_enrollments
    where learner_id = p_learner_id and course_id = p_course_id and status in ('active','completed')
  ) then
    raise exception 'Learner is not enrolled in this course';
  end if;

  select * into v_certificate from public.sahan_certificates
  where course_id = p_course_id and learner_id = p_learner_id;
  if found then
    return v_certificate;
  end if;

  v_no := 'SAH-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into public.sahan_certificates(course_id, instructor_id, learner_id, learner_name, certificate_no, issued_at, verified)
  values (p_course_id, p_instructor_id, p_learner_id, trim(p_learner_name), v_no, now(), true)
  returning * into v_certificate;
  return v_certificate;
end;
$$;

revoke all on function public.issue_sahan_certificate(uuid,uuid,uuid,text) from public;
grant execute on function public.issue_sahan_certificate(uuid,uuid,uuid,text) to authenticated, service_role;

create or replace function public.verify_sahan_certificate(p_certificate_no text)
returns table(certificate_no text, learner_name text, course_title text, issued_at timestamptz, verified boolean)
language sql stable security definer set search_path = public
as $$
  select c.certificate_no, c.learner_name, sc.title, c.issued_at, c.verified
  from public.sahan_certificates c
  join public.sahan_courses sc on sc.id = c.course_id
  where c.certificate_no = p_certificate_no and c.verified = true;
$$;
revoke all on function public.verify_sahan_certificate(text) from public;
grant execute on function public.verify_sahan_certificate(text) to anon, authenticated, service_role;
