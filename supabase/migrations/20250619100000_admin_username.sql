-- Admin login by username (maps to auth email for signInWithPassword)

alter table public.admin_users
  add column if not exists username text;

update public.admin_users
set username = split_part(email, '@', 1)
where username is null and email is not null;

alter table public.admin_users
  alter column username set not null;

create unique index if not exists admin_users_username_key on public.admin_users (username);

-- Lookup auth email by username (anon can call — needed before login)
create or replace function public.lookup_admin_email(p_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select email into v_email
  from public.admin_users
  where username = trim(lower(p_username))
  limit 1;

  return v_email;
end;
$$;

revoke all on function public.lookup_admin_email(text) from public;
grant execute on function public.lookup_admin_email(text) to anon, authenticated;
