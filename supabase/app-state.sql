-- Cloud state table used by /api/inventory-snapshot.
-- Run this once in the Supabase SQL editor for the project connected to this app.

create table if not exists public.app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- The Next.js API route uses SUPABASE_SERVICE_ROLE_KEY server-side.
-- Service-role requests bypass RLS, so no public browser policy is needed.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY to the browser.
