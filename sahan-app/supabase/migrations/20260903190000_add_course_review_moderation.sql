-- Admin moderation for learner course reviews.
alter table public.sahan_course_reviews add column if not exists status text not null default 'pending';
alter table public.sahan_course_reviews add column if not exists reviewed_by uuid references auth.users(id);
alter table public.sahan_course_reviews add column if not exists reviewed_at timestamptz;
alter table public.sahan_course_reviews add column if not exists rejection_reason text;
alter table public.sahan_course_reviews drop constraint if exists sahan_course_reviews_status_check;
alter table public.sahan_course_reviews add constraint sahan_course_reviews_status_check check(status in ('pending','approved','rejected'));
alter table public.sahan_course_reviews enable row level security;

drop policy if exists "course reviews public approved" on public.sahan_course_reviews;
create policy "course reviews public approved" on public.sahan_course_reviews for select to anon,authenticated using(status='approved');
drop policy if exists "course reviews learner own" on public.sahan_course_reviews;
create policy "course reviews learner own" on public.sahan_course_reviews for select to authenticated using(auth.uid()=learner_id);
drop policy if exists "course reviews insert own" on public.sahan_course_reviews;
create policy "course reviews insert own" on public.sahan_course_reviews for insert to authenticated with check(auth.uid()=learner_id);
drop policy if exists "course reviews admin read" on public.sahan_course_reviews;
create policy "course reviews admin read" on public.sahan_course_reviews for select to authenticated using(public.is_sahan_admin());

create or replace function public.moderate_course_review(p_review_id uuid,p_decision text,p_reason text default null)
returns void language plpgsql security definer set search_path=public as $$
declare reviewer_role text; admin_active boolean;
begin
 select role,is_active into reviewer_role,admin_active from public.sahan_admin_users where auth_user_id=auth.uid();
 if not coalesce(admin_active,false) or reviewer_role not in ('super_admin','support_admin','sales_admin') then raise exception 'You are not allowed to moderate reviews'; end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid decision'; end if;
 update public.sahan_course_reviews set status=p_decision,reviewed_by=auth.uid(),reviewed_at=now(),rejection_reason=case when p_decision='rejected' then p_reason else null end,updated_at=now() where id=p_review_id and status='pending';
 if not found then raise exception 'Review not found or already moderated'; end if;
end; $$;
revoke all on function public.moderate_course_review(uuid,text,text) from public;
grant execute on function public.moderate_course_review(uuid,text,text) to authenticated;
