-- Pet Focus: students, usage tracking, admin access

-- Students (1 student_id = 1 device)
create table public.students (
  id uuid primary key references auth.users (id) on delete cascade,
  student_id text not null,
  device_id text not null,
  created_at timestamptz not null default now(),
  constraint students_student_id_key unique (student_id),
  constraint students_device_id_key unique (device_id)
);

create index students_student_id_idx on public.students (student_id);

-- Admin users (seed manually after creating auth user)
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- Focus sessions
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  duration_minutes integer not null default 0,
  status text not null check (status in ('completed', 'failed', 'cancelled')),
  coins_earned integer not null default 0,
  started_at timestamptz,
  ended_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index focus_sessions_student_id_idx on public.focus_sessions (student_id);
create index focus_sessions_created_at_idx on public.focus_sessions (created_at desc);

-- Daily screen time / usage
create table public.daily_usage (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  date date not null,
  total_screen_minutes integer not null default 0,
  focus_minutes integer not null default 0,
  top_apps jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint daily_usage_student_date_key unique (student_id, date)
);

create index daily_usage_date_idx on public.daily_usage (date desc);

-- Chore quest completions
create table public.chore_completions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  quest_id text not null,
  date date not null,
  coins_earned integer not null default 0,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index chore_completions_student_id_idx on public.chore_completions (student_id);
create index chore_completions_date_idx on public.chore_completions (date desc);

-- Helper: check if current user is admin (after admin_users exists)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- RLS
alter table public.students enable row level security;
alter table public.admin_users enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.daily_usage enable row level security;
alter table public.chore_completions enable row level security;

-- students policies
create policy students_select_own on public.students
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy students_insert_own on public.students
  for insert to authenticated
  with check (id = auth.uid());

-- admin_users: only admins can read (for self-check in app)
create policy admin_users_select on public.admin_users
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- focus_sessions
create policy focus_sessions_select on public.focus_sessions
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.is_admin()
  );

create policy focus_sessions_insert on public.focus_sessions
  for insert to authenticated
  with check (student_id = auth.uid());

-- daily_usage
create policy daily_usage_select on public.daily_usage
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.is_admin()
  );

create policy daily_usage_insert on public.daily_usage
  for insert to authenticated
  with check (student_id = auth.uid());

create policy daily_usage_update on public.daily_usage
  for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- chore_completions
create policy chore_completions_select on public.chore_completions
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.is_admin()
  );

create policy chore_completions_insert on public.chore_completions
  for insert to authenticated
  with check (student_id = auth.uid());

-- Register student RPC (called after anonymous sign-in)
create or replace function public.register_student(
  p_student_id text,
  p_device_id text
)
returns public.students
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.students;
  v_normalized text;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  v_normalized := trim(p_student_id);
  if v_normalized = '' then
    raise exception 'INVALID_STUDENT_ID';
  end if;

  if length(trim(p_device_id)) = 0 then
    raise exception 'INVALID_DEVICE_ID';
  end if;

  if exists (select 1 from public.students where student_id = v_normalized) then
    raise exception 'STUDENT_ALREADY_REGISTERED';
  end if;

  if exists (select 1 from public.students where device_id = p_device_id) then
    raise exception 'DEVICE_ALREADY_REGISTERED';
  end if;

  if exists (select 1 from public.students where id = v_uid) then
    raise exception 'ALREADY_REGISTERED';
  end if;

  insert into public.students (id, student_id, device_id)
  values (v_uid, v_normalized, p_device_id)
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.register_student(text, text) from public;
grant execute on function public.register_student(text, text) to authenticated;
