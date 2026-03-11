-- Intent: Provide a reusable trigger function for updated_at columns.
-- Why: Avoid repeating trigger logic across profiles, events, calendars.
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
