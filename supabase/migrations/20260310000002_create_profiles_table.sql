-- Intent: Extend auth.users with app-specific profile data and preferences.
-- Why: 1:1 profile per user for display name, avatar, and settings.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  preferred_timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_current_timestamp_updated_at();
