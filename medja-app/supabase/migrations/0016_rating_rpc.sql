-- Public rating submission: a client with a job's link can rate it (1-5).
-- SECURITY DEFINER so anon can insert without a broad ratings insert policy.

create or replace function public.submit_rating(
  p_job_id uuid,
  p_stars  int,
  p_comment text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company uuid;
  v_staff   uuid;
begin
  if p_stars < 1 or p_stars > 5 then
    raise exception 'stars must be 1-5';
  end if;

  select company_id into v_company from public.jobs where id = p_job_id;
  if v_company is null then raise exception 'unknown job'; end if;

  -- attribute to the first assigned staff member, if any
  select staff_id into v_staff
  from public.job_assignments where job_id = p_job_id limit 1;

  insert into public.ratings (company_id, job_id, staff_id, stars, comment)
  values (v_company, p_job_id, v_staff, p_stars, nullif(trim(p_comment), ''));
end;
$$;
grant execute on function public.submit_rating(uuid, int, text) to anon, authenticated;

-- Minimal public read of a job's client name for the rating page header.
create or replace function public.job_for_rating(p_job_id uuid)
returns table (client_name text)
language sql
stable
security definer
set search_path = public
as $$
  select c.name
  from public.jobs j join public.clients c on c.id = j.client_id
  where j.id = p_job_id;
$$;
grant execute on function public.job_for_rating(uuid) to anon, authenticated;
