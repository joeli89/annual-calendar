-- Intent: Only admins can upload, update, or delete objects in the event-images bucket.
-- Why: Public read is handled by the bucket; write operations restricted to profiles.is_admin = true.

create policy "Admins can insert into event-images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can update event-images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'event-images'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can delete from event-images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'event-images'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );
