-- Free-text notes on a client (preferences, access quirks, history).
alter table public.clients
  add column if not exists notes text;
