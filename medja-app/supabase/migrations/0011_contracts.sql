-- Recurring commercial contracts that auto-generate jobs and monthly invoices.

create table if not exists public.contracts (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  client_id     uuid not null references public.clients(id) on delete cascade,
  site_id       uuid references public.client_sites(id) on delete set null,
  title         text not null,
  -- weekdays the job runs, 0=Sun .. 6=Sat, e.g. '{1,2,3,4,5}' for Mon-Fri
  weekdays      int[] not null default '{1,2,3,4,5}',
  time_of_day   time not null default '08:00',
  monthly_kobo  bigint not null default 0,
  billing_day   int not null default 1,   -- day of month to invoice
  active        boolean not null default true,
  last_generated_on date,                 -- horizon watermark for job generation
  created_at    timestamptz not null default now()
);
create index if not exists contracts_company_idx on public.contracts(company_id);

alter table public.contracts enable row level security;
create policy contracts_all on public.contracts
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());

-- Mark a job as generated from a contract (so we don't double-book).
alter table public.jobs
  add column if not exists contract_id uuid references public.contracts(id) on delete set null;
create index if not exists jobs_contract_idx on public.jobs(contract_id);
