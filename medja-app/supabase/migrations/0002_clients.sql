-- Clients CRM: clients + their sites. Tenant-scoped by company_id.

create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name       text not null,
  phone      text,
  kind       text not null default 'residential',  -- residential | commercial | developer
  created_at timestamptz not null default now()
);
create index if not exists clients_company_idx on public.clients(company_id);

create table if not exists public.client_sites (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  client_id   uuid not null references public.clients(id) on delete cascade,
  label       text not null,
  address     text,
  access_note text,
  created_at  timestamptz not null default now()
);
create index if not exists client_sites_client_idx on public.client_sites(client_id);

alter table public.clients      enable row level security;
alter table public.client_sites enable row level security;

create policy clients_all on public.clients
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());

create policy client_sites_all on public.client_sites
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
