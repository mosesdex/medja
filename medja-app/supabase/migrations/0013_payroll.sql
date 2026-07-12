-- Payroll runs: a period's computed payout per staff member.

create table if not exists public.payroll_runs (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  period_start date not null,
  period_end   date not null,
  total_kobo   bigint not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.payroll_items (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  run_id      uuid not null references public.payroll_runs(id) on delete cascade,
  staff_id    uuid not null references public.staff_profiles(id) on delete cascade,
  jobs_count  int not null default 0,
  amount_kobo bigint not null default 0
);
create index if not exists payroll_items_run_idx on public.payroll_items(run_id);

alter table public.payroll_runs  enable row level security;
alter table public.payroll_items enable row level security;

create policy payroll_runs_all on public.payroll_runs
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
create policy payroll_items_all on public.payroll_items
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
