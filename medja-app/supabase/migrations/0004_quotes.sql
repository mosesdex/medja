-- Quotes: room-count/property-type templates with naira floors, and built quotes.

create table if not exists public.quote_templates (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  label      text not null,
  floor_kobo bigint not null,
  position   int not null default 0
);
create index if not exists quote_templates_company_idx on public.quote_templates(company_id);

create table if not exists public.quotes (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id  uuid not null references public.clients(id) on delete cascade,
  total_kobo bigint not null default 0,
  status     text not null default 'draft',  -- draft | sent | accepted | invoiced
  created_at timestamptz not null default now()
);
create index if not exists quotes_company_idx on public.quotes(company_id);

create table if not exists public.quote_lines (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  quote_id    uuid not null references public.quotes(id) on delete cascade,
  label       text not null,
  amount_kobo bigint not null
);
create index if not exists quote_lines_quote_idx on public.quote_lines(quote_id);

alter table public.quote_templates enable row level security;
alter table public.quotes          enable row level security;
alter table public.quote_lines     enable row level security;

create policy quote_templates_all on public.quote_templates
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
create policy quotes_all on public.quotes
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
create policy quote_lines_all on public.quote_lines
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());

-- Seed default naira templates for a new company (called from create_company path
-- or on first visit). Idempotent per company.
create or replace function public.seed_default_templates(p_company uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.quote_templates where company_id = p_company) then
    return;
  end if;
  insert into public.quote_templates (company_id, label, floor_kobo, position) values
    (p_company, 'Single room + toilet',     1200000, 1),
    (p_company, '2-bedroom apartment',      2200000, 2),
    (p_company, '3-bedroom apartment',      3200000, 3),
    (p_company, '4-bedroom duplex',         5500000, 4),
    (p_company, 'Office — monthly contract', 0,      5),
    (p_company, 'Post-construction',         0,      6);
end;
$$;
grant execute on function public.seed_default_templates(uuid) to authenticated;
