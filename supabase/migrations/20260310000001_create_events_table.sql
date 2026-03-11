-- Intent: Canonical event records for list and detail screens.
-- Why: Align with mobile Event type and support filtering, maps, and media.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,

  -- Dates & display
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_all_day boolean not null default true,
  display_date_range text not null,

  -- Location
  location_name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  country text,
  latitude double precision,
  longitude double precision,

  -- Media
  hero_image_url text not null,
  image_urls text[] not null default '{}',

  -- External links
  website_url text,
  instagram_url text,
  x_url text,

  -- Misc
  tags text[] not null default '{}',
  is_published boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_start_at_idx on public.events (start_at);
create index events_is_published_idx on public.events (is_published);
create index events_tags_gin_idx on public.events using gin (tags);

-- Trigger for updated_at
create trigger set_events_updated_at
  before update on public.events
  for each row
  execute procedure public.set_current_timestamp_updated_at();
