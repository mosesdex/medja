-- Job assignments: which staff are dispatched to a job.

create table if not exists public.job_assignments (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  staff_id   uuid not null references public.staff_profiles(id) on delete cascade,
  unique (job_id, staff_id)
);
create index if not exists assignments_job_idx on public.job_assignments(job_id);
create index if not exists assignments_staff_idx on public.job_assignments(staff_id);

alter table public.job_assignments enable row level security;

create policy assignments_all on public.job_assignments
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());

-- A cleaner (linked staff user) can see jobs assigned to them.
create policy jobs_select_assigned on public.jobs
  for select using (
    exists (
      select 1
      from public.job_assignments a
      join public.staff_profiles s on s.id = a.staff_id
      where a.job_id = jobs.id and s.user_id = auth.uid()
    )
  );

-- A cleaner can update status/checklist on their assigned jobs.
create policy jobs_update_assigned on public.jobs
  for update using (
    exists (
      select 1
      from public.job_assignments a
      join public.staff_profiles s on s.id = a.staff_id
      where a.job_id = jobs.id and s.user_id = auth.uid()
    )
  );

create policy checklist_assigned on public.job_checklist_items
  for all using (
    exists (
      select 1
      from public.job_assignments a
      join public.staff_profiles s on s.id = a.staff_id
      where a.job_id = job_checklist_items.job_id and s.user_id = auth.uid()
    )
  );
