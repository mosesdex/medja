-- Medja core schema: multi-tenant companies + members, with RLS.
-- Every domain table carries company_id and is guarded by auth_company_id().

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Companies
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  city          text,
  service_types text[] default '{}',
  created_at    timestamptz not null default now()
);

-- Members: maps an auth user to a company + role.
create type public.member_role as enum ('owner', 'supervisor', 'accountant', 'cleaner');

create table if not exists public.members (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role       public.member_role not null default 'owner',
  name       text not null,
  created_at timestamptz not null default now(),
  unique (user_id)  -- one company per user in v1
);

create index if not exists members_company_idx on public.members(company_id);

-- ---------------------------------------------------------------------------
-- Tenancy helper: the caller's company_id (from their membership row).
-- SECURITY DEFINER so it can read members regardless of RLS.
-- ---------------------------------------------------------------------------
create or replace function public.auth_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.members where user_id = auth.uid() limit 1;
$$;

create or replace function public.auth_role()
returns public.member_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.members where user_id = auth.uid() limit 1;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.companies enable row level security;
alter table public.members   enable row level security;

-- A user can see their own company.
create policy companies_select on public.companies
  for select using (id = public.auth_company_id());

create policy companies_update on public.companies
  for update using (id = public.auth_company_id() and public.auth_role() = 'owner');

-- A user can see members of their own company.
create policy members_select on public.members
  for select using (company_id = public.auth_company_id());

-- Owners manage members of their company.
create policy members_insert on public.members
  for insert with check (company_id = public.auth_company_id() and public.auth_role() = 'owner');

create policy members_update on public.members
  for update using (company_id = public.auth_company_id() and public.auth_role() = 'owner');

create policy members_delete on public.members
  for delete using (company_id = public.auth_company_id() and public.auth_role() = 'owner');

-- ---------------------------------------------------------------------------
-- Onboarding RPC: create a company and make the caller its owner.
-- SECURITY DEFINER so the first member insert bypasses the members RLS
-- (which would otherwise require an existing owner).
-- ---------------------------------------------------------------------------
create or replace function public.create_company(
  p_name          text,
  p_city          text,
  p_service_types text[],
  p_owner_name    text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from public.members where user_id = auth.uid()) then
    raise exception 'user already belongs to a company';
  end if;

  insert into public.companies (name, city, service_types)
  values (p_name, p_city, coalesce(p_service_types, '{}'))
  returning id into v_company_id;

  insert into public.members (user_id, company_id, role, name)
  values (auth.uid(), v_company_id, 'owner', p_owner_name);

  return v_company_id;
end;
$$;

grant execute on function public.create_company(text, text, text[], text) to authenticated;
grant execute on function public.auth_company_id() to authenticated;
grant execute on function public.auth_role() to authenticated;
