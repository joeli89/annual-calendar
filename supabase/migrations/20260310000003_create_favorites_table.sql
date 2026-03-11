-- Intent: Per-user saved events for the heart/save action on event detail.
-- Why: Composite primary key prevents duplicates; created_at for ordering.
create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (user_id, event_id)
);

create index favorites_event_id_idx on public.favorites (event_id);
