-- Allow reinstall: same student_id + device_id → bind new anonymous auth uid, keep history

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
  v_existing public.students;
  v_normalized text;
  v_device text;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  v_normalized := trim(p_student_id);
  if v_normalized = '' then
    raise exception 'INVALID_STUDENT_ID';
  end if;

  v_device := trim(p_device_id);
  if v_device = '' then
    raise exception 'INVALID_DEVICE_ID';
  end if;

  -- Same student + same device (e.g. reinstall): re-link to current auth session
  select * into v_existing
  from public.students
  where student_id = v_normalized
    and device_id = v_device;

  if found then
    if v_existing.id = v_uid then
      return v_existing;
    end if;

    -- Free unique constraints on student_id / device_id before inserting new row
    update public.students
    set
      student_id = v_normalized || ':restore:' || v_existing.id::text,
      device_id = v_device || ':restore:' || v_existing.id::text
    where id = v_existing.id;

    -- New students row must exist before child FK updates (focus_sessions, etc.)
    insert into public.students (id, student_id, device_id)
    values (v_uid, v_normalized, v_device)
    returning * into v_row;

    update public.focus_sessions set student_id = v_uid where student_id = v_existing.id;
    update public.daily_usage set student_id = v_uid where student_id = v_existing.id;
    update public.chore_completions set student_id = v_uid where student_id = v_existing.id;

    delete from public.students where id = v_existing.id;

    return v_row;
  end if;

  if exists (select 1 from public.students where student_id = v_normalized) then
    raise exception 'STUDENT_ALREADY_REGISTERED';
  end if;

  if exists (select 1 from public.students where device_id = v_device) then
    raise exception 'DEVICE_ALREADY_REGISTERED';
  end if;

  if exists (select 1 from public.students where id = v_uid) then
    raise exception 'ALREADY_REGISTERED';
  end if;

  insert into public.students (id, student_id, device_id)
  values (v_uid, v_normalized, v_device)
  returning * into v_row;

  return v_row;
end;
$$;
