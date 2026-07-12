-- Expenses: supplies, transport, staff advances — for profit-per-period.

create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  category    text not null default 'supplies',  -- supplies | transport | advance | other
  note        text,
  amount_kobo bigint not null,
  spent_on    date not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists expenses_company_idx on public.expenses(company_id);

alter table public.expenses enable row level security;
create policy expenses_all on public.expenses
  for all using (company_id = public.auth_company_id())
  with check (company_id = public.auth_company_id());
