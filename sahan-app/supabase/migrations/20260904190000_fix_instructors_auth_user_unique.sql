-- Fix creator approval trigger: it uses ON CONFLICT(auth_user_id),
-- so instructors.auth_user_id must have a unique constraint/index.
-- The partial index preserves support for instructors created before auth linkage.
create unique index if not exists instructors_auth_user_id_key
  on public.instructors(auth_user_id)
  where auth_user_id is not null;
