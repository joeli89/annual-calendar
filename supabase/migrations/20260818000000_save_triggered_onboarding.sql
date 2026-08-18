-- Save-triggered onboarding: completion stamp, server-side answer validation,
-- and an insert-only analytics_events table for funnel drop-off measurement.
-- RLS controls WHO can write; these CHECKs control WHAT they write.
-- NOTE: applied to the linked project (vhlncvqhykmjpmyskmue) on 2026-08-18 via
-- the Supabase MCP as migration "save_triggered_onboarding"; this file mirrors
-- it for the repo history.

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.profiles.onboarding_completed_at is
  'Set when the user finishes (or skips through) the onboarding flow; null = resume at first unanswered step.';

-- Replace the collection_size check: onboarding adds a '0' bucket.
alter table public.profiles drop constraint if exists profiles_collection_size_check;
alter table public.profiles add constraint profiles_collection_size_check
  check (collection_size is null or collection_size in ('0','1-3','4-8','9+'));

-- Replace the favorite_brands cardinality check with the 1-6 length rule.
-- array_length of the default '{}' is NULL, so empty stays valid.
alter table public.profiles drop constraint if exists profiles_favorite_brands_check;
alter table public.profiles drop constraint if exists profiles_favorite_brands_len;
alter table public.profiles add constraint profiles_favorite_brands_len
  check (array_length(favorite_brands,1) is null or array_length(favorite_brands,1) between 1 and 6);

-- 18+ rule enforced at the database, not only in the wheel-picker UI.
alter table public.profiles drop constraint if exists profiles_dob_18plus;
alter table public.profiles add constraint profiles_dob_18plus
  check (date_of_birth is null or date_of_birth <= (current_date - interval '18 years'));

-- Funnel analytics: clients (anon or authed) may insert; nobody reads via the
-- API (query with service role / SQL only).
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  props jsonb not null default '{}'::jsonb,
  device_id text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.analytics_events is
  'Client funnel events (save-triggered onboarding). Insert-only from the app; read via SQL.';

alter table public.analytics_events enable row level security;

drop policy if exists analytics_events_insert on public.analytics_events;
create policy analytics_events_insert on public.analytics_events
  for insert to anon, authenticated
  with check (
    -- authed inserts must carry their own user_id (or none); anon must carry none
    user_id is null or user_id = auth.uid()
  );

create index if not exists analytics_events_event_created_idx
  on public.analytics_events (event, created_at);
create index if not exists analytics_events_device_idx
  on public.analytics_events (device_id, created_at);
