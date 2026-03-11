/**
 * Intent: Supabase client for the CMS admin app.
 * Why: Uses VITE_ env vars so keys stay out of source and work at build time.
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy admin/.env.example to admin/.env and set values.'
  );
}

export const supabase = createClient(url, anonKey);
