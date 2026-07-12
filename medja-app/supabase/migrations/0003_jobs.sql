-- Jobs + checklists. Three job types, a status pipeline, per-job checklist items.

create type public.job_type   as enum ('residential', 'commercial', 'post_construction');
create type public.job_status as enum ('booked', 'en_route', 'in_progress', 'done', 'invoiced', 'paid');

create table if not exists public.jobs (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  client_id    uuid not null references public.clients(id) on delete restrict,
  site_id      uuid references public.client_sites(id) on delete set null,
  type         public.job_type not null,
  status       public.job_status not null default 'booked',
  scheduled_at timestamptz not null,
  value_kobo   bigint,
  notes        text,
  created_at   timestamptz not null default now()
);
create index if not exists jobs_company_sched_idx on public.jobs(company_id, scheduled_at);

create table if not exists public.job_checklist_items (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  label      text not null,
  done       boolean not null default false,
  position   int not null default 0
);
create index if not exists checklist_job_idx on public.job_checklist_items(job_id);

alter table public.jobs                 enable row level security;
alter table public.job_checklist_items  enable row level security;

create policy jobs_all on public.jobs
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());

create policy checklist_all on public.job_checklist_items
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
