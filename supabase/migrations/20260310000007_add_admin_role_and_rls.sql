-- Intent: Allow CMS admins to manage events and calendars via RLS.
-- Why: Only users with profiles.is_admin = true can insert/update/delete events and calendar data.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Admins can view all events (including unpublished)
create policy "Admins can view all events"
  on public.events for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

-- Admins can insert/update/delete events
create policy "Admins can insert events"
  on public.events for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can update events"
  on public.events for update
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can delete events"
  on public.events for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

-- Admins can manage calendar_events
create policy "Admins can insert calendar_events"
  on public.calendar_events for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can update calendar_events"
  on public.calendar_events for update
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can delete calendar_events"
  on public.calendar_events for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

-- Admins can manage calendars
create policy "Admins can insert calendars"
  on public.calendars for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can update calendars"
  on public.calendars for update
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can delete calendars"
  on public.calendars for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );
