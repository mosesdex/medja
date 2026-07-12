-- Client ratings for completed jobs (1-5), optional per-staff.

create table if not exists public.ratings (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id     uuid references public.jobs(id) on delete set null,
  staff_id   uuid references public.staff_profiles(id) on delete set null,
  stars      int not null check (stars between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);
create index if not exists ratings_company_idx on public.ratings(company_id);
create index if not exists ratings_staff_idx on public.ratings(staff_id);

alter table public.ratings enable row level security;

-- Owners read their company's ratings.
create policy ratings_select on public.ratings
  for select using (company_id = public.auth_company_id());
-- Ratings are inserted via a SECURITY DEFINER RPC from the public booking/rating
-- flow, so no public insert policy is granted here.
