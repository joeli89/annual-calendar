# Annual Calendar

A calendar app with a **mobile client** (Expo/React Native) and an **admin CMS** (Vite/React) for managing events. Backend is [Supabase](https://supabase.com) (Postgres, Auth, optional Storage for images).

## What’s in this repo

| Folder      | Description |
|------------|-------------|
| **mobile** | Expo app: event list, event detail, maps, favorites. Uses Supabase for data and auth. |
| **admin**  | Web CMS to create/edit/delete events. Only users with `profiles.is_admin = true` can sign in. |
| **supabase** | SQL migrations for tables, RLS, and storage. Run these against your Supabase project. |

## Prerequisites

- **Node.js** (v18+)
- **npm**
- A **Supabase** account and project
- For mobile: **Expo CLI** (or use `npx expo`), and for native builds: Xcode (iOS) and/or Android Studio (Android)
- Optional: **Google Maps API key** for map tiles on Android (see [Mobile → Maps](#mobile---maps) below)

## Getting started

### 1. Supabase project

1. Create a project at [Supabase Dashboard](https://supabase.com/dashboard).
2. In **Project Settings → API**, note:
   - **Project URL**
   - **anon public** key (used by both mobile and admin)

### 2. Run database migrations

Apply all migrations in `supabase/migrations/` so you have `events`, `profiles`, `calendars`, `calendar_events`, `favorites`, RLS, and (if used) storage policies.

**Option A – Supabase CLI (recommended)**

```bash
# From repo root
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

**Option B – Manual**

Run each `.sql` file in `supabase/migrations/` in order (by filename) in the Supabase **SQL Editor**.

### 3. Mobile app

```bash
cd mobile
cp .env.example .env
```

Edit `mobile/.env` and set:

- `EXPO_PUBLIC_SUPABASE_URL` – your Supabase project URL  
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` – your Supabase anon key  

Then:

```bash
npm install
npm start
```

Use the Expo dev client (scan QR code, or run `npm run ios` / `npm run android` for a simulator/emulator).

### 4. Admin CMS

```bash
cd admin
cp .env.example .env
```

Edit `admin/.env` and set:

- `VITE_SUPABASE_URL` – same Supabase project URL  
- `VITE_SUPABASE_ANON_KEY` – same anon key  

Optional: `VITE_SUPABASE_STORAGE_BUCKET` (default: `event-images`).

Then:

```bash
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`). You must sign in with a user that has **`profiles.is_admin = true`** (set in Supabase **Table Editor → profiles** after the user has signed up once).

For full CMS setup (marking an admin, creating events, deployment), see **[admin/README.md](admin/README.md)**.

---

## Mobile – Maps

- **iOS**: Uses Apple Maps by default; no key required for basic use.
- **Android**: Configure a Google Maps API key in `mobile/app.json` under `expo.android.config.googleMaps.apiKey`, or map tiles may not load.

## Project structure (high level)

- **mobile/app** – Expo Router screens (tabs, events list, event detail).
- **mobile/components** – Shared UI (e.g. event cards, map).
- **mobile/lib** – Supabase client and helpers.
- **admin/src** – React app (events list, create/edit forms).
- **supabase/migrations** – Schema and RLS; apply in order.

## Environment files

- **mobile**: `.env` from `.env.example` – `EXPO_PUBLIC_*` for Supabase.
- **admin**: `.env` from `.env.example` – `VITE_SUPABASE_*` (and optional storage bucket).

Do not commit `.env`; only commit the `.env.example` files.

## Deploying

- **Admin**: Run `npm run build` in `admin/` and deploy the `admin/dist/` folder to any static host (Vercel, Netlify, Supabase Hosting, etc.). Set the same `VITE_*` env vars in the host’s dashboard.
- **Mobile**: Use EAS Build or your preferred Expo/React Native build pipeline; ensure production env has the correct `EXPO_PUBLIC_*` values.
