-- Staff profiles with vetting (ID/NIN + guarantor) and teams.

create type public.vetting_status as enum ('pending', 'in_progress', 'vetted', 'rejected');

create table if not exists public.staff_profiles (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  -- optional link to an auth user if the cleaner logs into the app
  user_id           uuid references auth.users(id) on delete set null,
  name              text not null,
  phone             text,
  role_title        text default 'Cleaner',
  nin               text,
  nin_doc_path      text,           -- Storage path in the private staff-docs bucket
  photo_path        text,
  guarantor_name    text,
  guarantor_phone   text,
  guarantor_address text,
  guarantor_id_path text,
  vetting_status    public.vetting_status not null default 'pending',
  background_check  text,           -- e.g. 'cleared 2025-02'
  pay_kobo          bigint,         -- rate; interpretation via pay_basis
  pay_basis         text default 'per_job',  -- per_job | per_day | monthly
  created_at        timestamptz not null default now()
);
create index if not exists staff_company_idx on public.staff_profiles(company_id);
create index if not exists staff_user_idx on public.staff_profiles(user_id);

create table if not exists public.teams (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name       text not null
);

create table if not exists public.team_members (
  team_id  uuid not null references public.teams(id) on delete cascade,
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  primary key (team_id, staff_id)
);

alter table public.staff_profiles enable row level security;
alter table public.teams          enable row level security;
alter table public.team_members   enable row level security;

create policy staff_all on public.staff_profiles
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
create policy teams_all on public.teams
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
-- team_members inherit tenancy through the team; restrict to same company.
create policy team_members_all on public.team_members
  for all using (
    exists (select 1 from public.teams t
            where t.id = team_id and t.company_id = public.auth_company_id())
  )
  with check (
    exists (select 1 from public.teams t
            where t.id = team_id and t.company_id = public.auth_company_id())
  );
