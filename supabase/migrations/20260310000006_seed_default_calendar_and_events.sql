-- Intent: Seed default calendar and sample events so the app has data after migration.
-- Why: Optional; run only if you want initial data. Safe to skip or delete.

insert into public.calendars (slug, name, description)
values ('default', 'Annual Calendar', 'Main event feed')
on conflict (slug) do nothing;

-- Seed events (aligned with mobile/data/events.ts). Uses explicit UUIDs for stable references.
insert into public.events (
  id,
  slug,
  title,
  description,
  start_at,
  end_at,
  display_date_range,
  location_name,
  hero_image_url,
  image_urls,
  latitude,
  longitude
)
values
  (
    'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
    'watches-wonders-2026',
    'Watches & Wonders',
    'A focused showcase of new releases, private previews, and collector-led panels across the city.',
    '2026-02-24T00:00:00Z',
    '2026-02-26T23:59:59Z',
    '24th to 26th February 2026',
    'Geneva, Switzerland',
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80',
    array[
      'https://images.unsplash.com/photo-1506224774220-b8d888b4f5b1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=600&q=80'
    ],
    46.2044,
    6.1432
  ),
  (
    'b2c3d4e5-f6a7-4890-b123-456789012345'::uuid,
    'dubai-watch-week-2026',
    'Dubai Watch Week',
    'Hands-on workshops, heritage talks, and limited-edition previews set against a luxury desert backdrop.',
    '2026-03-10T00:00:00Z',
    '2026-03-14T23:59:59Z',
    '10th to 14th March 2026',
    'Dubai, UAE',
    'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80',
    array[
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=600&q=80'
    ],
    25.2048,
    55.2708
  ),
  (
    'c3d4e5f6-a7b8-4901-c234-567890123456'::uuid,
    'sxsw-2026',
    'SXSW',
    'Music, film, and tech converge for keynotes, screenings, and networking across the city.',
    '2026-03-13T00:00:00Z',
    '2026-03-22T23:59:59Z',
    '13th to 22nd March 2026',
    'Austin, USA',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
    array[
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80'
    ],
    30.2672,
    -97.7431
  ),
  (
    'd4e5f6a7-b8c9-4012-d345-678901234567'::uuid,
    'art-basel-hong-kong-2026',
    'Art Basel Hong Kong',
    'Leading galleries and artists from Asia and beyond in a flagship art fair.',
    '2026-03-19T00:00:00Z',
    '2026-03-21T23:59:59Z',
    '19th to 21st March 2026',
    'Hong Kong',
    'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=1200&q=80',
    array[
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1577083165633-14ebcdb0f658?auto=format&fit=crop&w=600&q=80'
    ],
    22.3193,
    114.1694
  ),
  (
    'e5f6a7b8-c9d0-4123-e456-789012345678'::uuid,
    'windup-watch-fair-2026',
    'Windup Watch Fair',
    'Independent makers, boutique brands, and hands-on try-ons in a relaxed, community-first setting.',
    '2026-04-03T00:00:00Z',
    '2026-04-05T23:59:59Z',
    '3rd to 5th April 2026',
    'New York, USA',
    'https://images.unsplash.com/photo-1470214304380-aadaedcfff02?auto=format&fit=crop&w=1200&q=80',
    array[
      'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506224774220-b8d888b4f5b1?auto=format&fit=crop&w=600&q=80'
    ],
    40.7128,
    -74.0060
  )
on conflict (id) do nothing;

-- Link all events to the default calendar
insert into public.calendar_events (calendar_id, event_id, sort_order)
select c.id, e.id, row_number() over (order by e.start_at) - 1
from public.calendars c
cross join public.events e
where c.slug = 'default'
on conflict (calendar_id, event_id) do nothing;
