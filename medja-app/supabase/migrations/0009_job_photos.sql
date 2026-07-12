-- Job photos: before/after images attached to a job, stored in Storage.

create type public.photo_kind as enum ('before', 'after');

create table if not exists public.job_photos (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  staff_id   uuid references public.staff_profiles(id) on delete set null,
  kind       public.photo_kind not null,
  path       text not null,       -- Storage path in the job-photos bucket
  created_at timestamptz not null default now()
);
create index if not exists job_photos_job_idx on public.job_photos(job_id);

alter table public.job_photos enable row level security;

create policy job_photos_select on public.job_photos
  for select using (company_id = public.auth_company_id());

create policy job_photos_insert on public.job_photos
  for insert with check (
    company_id = public.auth_company_id()
    or exists (
      select 1 from public.job_assignments a
      join public.staff_profiles s on s.id = a.staff_id
      where a.job_id = job_photos.job_id and s.user_id = auth.uid()
    )
  );

-- Storage buckets (private). Created idempotently; RLS on storage.objects
-- restricts access to a caller's own company folder (path prefixed company_id/).
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('staff-docs', 'staff-docs', false)
on conflict (id) do nothing;
