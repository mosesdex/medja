-- Job events: GPS check-in / check-out stamps for field staff.

create type public.job_event_type as enum ('check_in', 'check_out');

create table if not exists public.job_events (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  staff_id   uuid references public.staff_profiles(id) on delete set null,
  type       public.job_event_type not null,
  lat        double precision,
  lng        double precision,
  located    boolean not null default false,  -- false = geolocation denied/unavailable
  at         timestamptz not null default now()
);
create index if not exists job_events_job_idx on public.job_events(job_id);

alter table public.job_events enable row level security;

-- Owners see all events in their company; cleaners can insert for their jobs.
create policy job_events_select on public.job_events
  for select using (company_id = public.auth_company_id());

create policy job_events_insert on public.job_events
  for insert with check (
    company_id = public.auth_company_id()
    or exists (
      select 1 from public.job_assignments a
      join public.staff_profiles s on s.id = a.staff_id
      where a.job_id = job_events.job_id and s.user_id = auth.uid()
    )
  );
