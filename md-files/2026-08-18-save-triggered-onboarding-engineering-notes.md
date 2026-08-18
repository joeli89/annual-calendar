# Save-Triggered Onboarding — Engineering Notes

- **Date:** 2026-08-18
- **Owner:** Engineer (agent session)
- **Purpose:** Record what was built for the save-triggered onboarding flow, the decisions taken, and what remains before it can be called shipped.
- **Branch:** `claude/save-triggered-onboarding` (commit `826d7d1`)

## What was built

When an unauthenticated user taps Save on an event, the app now presents a bottom-sheet onboarding flow (Figma section 72:1655) instead of pushing the full-screen `/auth` route. The save intent survives the entire flow — including the app being backgrounded or killed during OAuth — and the event is saved the moment a session exists.

### Architecture

| Piece | File | Notes |
|---|---|---|
| Native social auth | `mobile/lib/socialAuth.ts` | Apple (expo-apple-authentication) + Google (@react-native-google-signin) → `supabase.auth.signInWithIdToken`. No browser redirect — the Safari→app hop that broke the previous auth is avoided entirely. Apple full name captured on first authorisation and used to prefill the name step. |
| Save intent | `mobile/lib/saveIntent.tsx` | `SaveIntentProvider`: intent persisted to AsyncStorage (`ac.pendingSave.v1`), 24h expiry, restored on cold start. Flushes automatically via a `user`-watching effect, so it fires no matter which step the user finished (or abandoned) on. |
| Idempotent save | `mobile/lib/eventsApi.ts` → `addFavorite()` | Non-toggling insert (treats 23505 as already-saved). `toggleFavorite` is never called on flush, so flushing against an already-saved event cannot un-save it. |
| Profile persistence | `mobile/lib/profileApi.ts` | UPDATE-only (the `on_auth_user_created` trigger owns INSERT). One small UPDATE per Continue; resume = first unanswered field. `watch_brands` read ordered by `sort_order` — no brand names in the client. |
| Sheet + steps | `mobile/components/onboarding/` | `OnboardingContext` hosts one `BottomSheetModal` app-wide; `OnboardingSheet` runs the step machine (auth → name → dob → location → collection → brands). Primitives: `OnboardingHeader`, `OnboardingTitle`, `SocialAuthButton`, `InputField`, `WheelPicker` (@react-native-picker/picker — native wheel on iOS, dropdown on Android, accepted), `PillTagList`, `PrimaryButton`. |
| Entry points | `app/events/[id].tsx`, `app/(tabs)/saved/index.tsx`, `app/profile.tsx` | All three now open the sheet; nothing routes to `/auth` any more (the magic-link screen is kept for Simulator/dev testing only). |
| Analytics | `mobile/lib/analytics.ts` + `public.analytics_events` | Typed funnel events (save_intent_started … save_intent_flushed) inserted into Supabase with a stable anonymous device id, insert-only RLS. Per-step drop-off is queryable in SQL from day one. |
| Migration | `supabase/migrations/20260818000000_save_triggered_onboarding.sql` | Applied to `vhlncvqhykmjpmyskmue` via MCP and verified: `onboarding_completed_at`, collection_size check now includes `'0'`, favorite_brands 1–6, DOB 18+, analytics table + RLS. |

### Decisions taken (within the locked spec)

- **Flush timing:** the pending save flushes the moment `user` becomes non-null — not at onboarding completion. This single rule satisfies dismiss-after-auth, returning-user-one-tap, and app-killed-mid-OAuth at once.
- **Skip semantics:** "Skip for now" on DOB/location/collection/brands; name has no skip (it's the one required field). Skipping the last step still stamps `onboarding_completed_at` so the flow never re-opens.
- **Under-18 DOB:** Continue disabled + inline message; DB check is the backstop.
- **AC monogram is drawn in code** (bordered rect + Playfair "AC") because the only logo asset has a baked-in beige background. Asset request for Design below.
- **Pre-existing tsc breakage fixed in passing:** the project has `strictNullChecks` off, so discriminated unions only narrow via `===`/`!==` comparisons — `app/auth.tsx` and the new auth result handling use explicit comparisons. `fontFamilies` is now exported from the design system barrel.

## Blocked on design (flagged, not invented)

- Success/confirmation state (frame 161:4166) is empty → flow ends at step 6 → dismiss; the save toast on the event screen is the only confirmation.
- Step 1 subtitle is placeholder in Figma ("Some text") → shipped "Save the events you don't want to miss." as interim copy.
- Step 5 subtitle is a copy-paste error in Figma → omitted.
- No progress indicator is designed.
- Asset request: AC monogram as a transparent PNG/SVG.

## Not shipped yet — required before TestFlight

Per the locked definition of "shipped", this is **merged code only** until observed on a device. Remaining:

1. **Native rebuild** (config is not OTA-able): `usesAppleSignIn`, apple-authentication plugin, google-signin plugin are in `app.json`.
2. **Google credentials:** create iOS + Web OAuth client IDs; set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `mobile/.env`; replace `REPLACE_WITH_REVERSED_IOS_CLIENT_ID` in `app.json`.
3. **Supabase dashboard:** enable Apple and Google providers (Apple: bundle id `app.annualcalendar.mobile`; Google: the Web client ID).
4. **Device verification on TestFlight** (Apple sign-in is not meaningfully testable in the Simulator). Explicitly test: kill mid-OAuth, already-saved event flush, dismiss-after-auth, partial-progress resume.
5. Verify funnel rows appear in `analytics_events` with expected payloads.
