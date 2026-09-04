-- Fix creator approval so it does not depend on a unique constraint on instructors.auth_user_id.
-- This makes approval work safely even when an older database is missing that index.

create or replace function public.review_creator_application(
  p_application_id uuid,
  p_decision text,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  a public.sahan_creator_applications%rowtype;
  reviewer_role text;
  admin_active boolean;
  instructor_id uuid;
begin
  select role, is_active
    into reviewer_role, admin_active
  from public.sahan_admin_users
  where auth_user_id=auth.uid();

  if not coalesce(admin_active,false)
     or reviewer_role not in ('super_admin','sales_admin') then
    raise exception 'You are not allowed to review creator applications';
  end if;

  if p_decision not in ('approved','rejected') then
    raise exception 'Invalid decision';
  end if;

  select *
    into a
  from public.sahan_creator_applications
  where id=p_application_id
  for update;

  if not found then
    raise exception 'Application not found';
  end if;

  if a.status <> 'pending' then
    raise exception 'This application has already been reviewed';
  end if;

  update public.sahan_creator_applications
  set status=p_decision,
      reviewed_by=auth.uid(),
      reviewed_at=now(),
      rejection_reason=case when p_decision='rejected' then p_reason else null end,
      updated_at=now()
  where id=p_application_id;

  if p_decision='approved' then
    -- Promote the learner to instructor.
    update public.sahan_profiles
    set role='instructor'
    where id=a.user_id;

    -- Do not use ON CONFLICT here: older/live databases may not have
    -- instructors.auth_user_id declared UNIQUE. Update an existing instructor
    -- first; only insert when no matching instructor exists.
    update public.instructors
    set name=coalesce(a.full_name,a.name,'Creator'),
        email=a.email,
        status='active'
    where auth_user_id=a.user_id;

    if not found then
      insert into public.instructors(auth_user_id,name,email,status)
      values(a.user_id,coalesce(a.full_name,a.name,'Creator'),a.email,'active')
      returning id into instructor_id;
    end if;
  end if;
end;
$$;

revoke all on function public.review_creator_application(uuid,text,text) from public;
grant execute on function public.review_creator_application(uuid,text,text) to authenticated;
