-- Intent: Optional logical groupings of events (brands, curators, themes).
-- Why: Single default calendar now; multiple feeds later without schema change.
create table public.calendars (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_calendars_updated_at
  before update on public.calendars
  for each row
  execute procedure public.set_current_timestamp_updated_at();

-- Intent: Many-to-many join between calendars and events.
create table public.calendar_events (
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  sort_order int,
  is_featured boolean not null default false,

  primary key (calendar_id, event_id)
);

create index calendar_events_event_id_idx on public.calendar_events (event_id);
