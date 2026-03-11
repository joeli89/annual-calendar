-- Intent: Row-level security so public reads events/calendars, users own profiles/favorites.
-- Why: Enforce access rules in the database.

-- profiles: users can read and update only their own row
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- events: anyone can read published events; mutations via service role only
alter table public.events enable row level security;

create policy "Anyone can view published events"
  on public.events for select
  using (is_published = true);

-- calendars: anyone can read
alter table public.calendars enable row level security;

create policy "Anyone can view calendars"
  on public.calendars for select
  using (true);

-- calendar_events: anyone can read
alter table public.calendar_events enable row level security;

create policy "Anyone can view calendar_events"
  on public.calendar_events for select
  using (true);

-- favorites: authenticated users can only access their own rows
alter table public.favorites enable row level security;

create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup (auth.users insert is in auth schema)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
