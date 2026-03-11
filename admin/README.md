# Annual Calendar CMS

Simple web app for managing events used by the Annual Calendar mobile app. Uses the same Supabase project; only users with `profiles.is_admin = true` can sign in and edit.

## Setup

1. **Environment variables**
   - Copy `admin/.env.example` to `admin/.env`.
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Supabase project URL and anon (publishable) key (same as the mobile app).
   - Get them from [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **API**.

2. **Database**
   - Run all migrations in `supabase/migrations/`, including `20260310000007_add_admin_role_and_rls.sql`, so that `profiles` has `is_admin` and admins can write to `events` / `calendar_events` / `calendars`.

3. **Mark an admin**
   - In Supabase **Table Editor** → **profiles**, set `is_admin = true` for the user(s) who should access the CMS.
   - If the profile row does not exist yet, sign up once (e.g. via the CMS login page with “Sign up” or via your app); the `handle_new_user` trigger creates a profile. Then set `is_admin = true` for that user in the Table Editor.

## Run locally

```bash
cd admin
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`). Sign in with an account that has `profiles.is_admin = true`.

## Build for production

```bash
cd admin
npm run build
```

Output is in `admin/dist/`. Deploy that folder to any static host (Vercel, Netlify, Supabase Hosting, etc.). Configure the same environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host’s dashboard so the build can access them at build time.

## Usage

- **Events** list: view all events, create new, edit, or delete.
- **New event**: fill the form; on save, the event is created and linked to the default calendar so it appears in the mobile app (when `is_published` is true).
- **Edit event**: change any field and save.
- **Images**: paste image URLs (e.g. from Supabase Storage or Unsplash). No file upload in this version.
