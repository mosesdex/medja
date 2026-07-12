-- Invoices with per-company sequential numbering, VAT, deposit tracking.

create table if not exists public.invoice_counters (
  company_id uuid primary key references public.companies(id) on delete cascade,
  next_seq   int not null default 1
);

create table if not exists public.invoices (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  client_id     uuid not null references public.clients(id) on delete restrict,
  job_id        uuid references public.jobs(id) on delete set null,
  number        text not null,
  subtotal_kobo bigint not null,
  vat_kobo      bigint not null default 0,
  deposit_kobo  bigint not null default 0,
  total_kobo    bigint not null,
  status        text not null default 'draft',  -- draft|sent|balance_due|overdue|paid
  due_at        timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists invoices_company_idx on public.invoices(company_id);

create table if not exists public.invoice_lines (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  invoice_id  uuid not null references public.invoices(id) on delete cascade,
  label       text not null,
  amount_kobo bigint not null
);
create index if not exists invoice_lines_invoice_idx on public.invoice_lines(invoice_id);

alter table public.invoice_counters enable row level security;
alter table public.invoices         enable row level security;
alter table public.invoice_lines    enable row level security;

create policy invoice_counters_all on public.invoice_counters
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
create policy invoices_all on public.invoices
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
create policy invoice_lines_all on public.invoice_lines
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());

-- Atomically allocate the next invoice number for a company, e.g. INV-0001.
create or replace function public.next_invoice_number(p_company uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq int;
begin
  insert into public.invoice_counters (company_id, next_seq)
  values (p_company, 1)
  on conflict (company_id) do nothing;

  update public.invoice_counters
     set next_seq = next_seq + 1
   where company_id = p_company
  returning next_seq - 1 into v_seq;

  return 'INV-' || lpad(v_seq::text, 4, '0');
end;
$$;
grant execute on function public.next_invoice_number(uuid) to authenticated;
