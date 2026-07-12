-- Payments against invoices: Paystack, cash (field), or bank transfer.

create type public.payment_method as enum ('paystack', 'cash', 'transfer');
create type public.payment_status as enum ('pending', 'confirmed');

create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  invoice_id    uuid references public.invoices(id) on delete set null,
  job_id        uuid references public.jobs(id) on delete set null,
  amount_kobo   bigint not null,
  method        public.payment_method not null,
  status        public.payment_status not null default 'confirmed',
  reference     text,              -- Paystack ref or transfer narration
  collected_by  uuid references public.staff_profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists payments_invoice_idx on public.payments(invoice_id);
create index if not exists payments_company_idx on public.payments(company_id);

alter table public.payments enable row level security;

create policy payments_select on public.payments
  for select using (company_id = public.auth_company_id());

-- Owners/accountants manage; cleaners may log cash against their assigned jobs.
create policy payments_insert on public.payments
  for insert with check (
    company_id = public.auth_company_id()
    or exists (
      select 1 from public.job_assignments a
      join public.staff_profiles s on s.id = a.staff_id
      where a.job_id = payments.job_id and s.user_id = auth.uid()
    )
  );

create policy payments_update on public.payments
  for update using (company_id = public.auth_company_id());
