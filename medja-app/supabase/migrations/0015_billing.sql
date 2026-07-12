-- SaaS billing: per-company subscription plan + public booking slug.

create type public.plan_tier as enum ('trial', 'starter', 'growth', 'pro');

alter table public.companies
  add column if not exists slug text unique,
  add column if not exists plan public.plan_tier not null default 'trial',
  add column if not exists trial_ends_on date default (current_date + 14);

create table if not exists public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references public.companies(id) on delete cascade,
  plan           public.plan_tier not null,
  paystack_ref   text,
  current_period_end date,
  created_at     timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy subscriptions_all on public.subscriptions
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());

-- Public read of the minimal company info needed to render a booking page.
create or replace function public.company_by_slug(p_slug text)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select id, name from public.companies where slug = p_slug;
$$;
grant execute on function public.company_by_slug(text) to anon, authenticated;

-- Public booking: create a lead client + a booked job request for a company.
create or replace function public.public_booking(
  p_slug        text,
  p_client_name text,
  p_phone       text,
  p_type        public.job_type,
  p_when        timestamptz,
  p_note        text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company uuid;
  v_client  uuid;
  v_job     uuid;
begin
  select id into v_company from public.companies where slug = p_slug;
  if v_company is null then raise exception 'unknown company'; end if;

  insert into public.clients (company_id, name, phone, kind)
  values (v_company, p_client_name, p_phone, 'residential')
  returning id into v_client;

  insert into public.jobs (company_id, client_id, type, scheduled_at, notes, status)
  values (v_company, v_client, p_type, p_when, p_note, 'booked')
  returning id into v_job;

  return v_job;
end;
$$;
grant execute on function public.public_booking(text, text, text, public.job_type, timestamptz, text) to anon, authenticated;
