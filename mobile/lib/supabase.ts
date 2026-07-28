/**
 * Intent: Initialize Supabase client for auth and data access.
 * Why: Single client instance with Expo env vars and session persistence via AsyncStorage.
 *
 * Magic links: In Supabase Dashboard > Authentication > URL Configuration, add to Redirect URLs:
 * - mobile://auth-callback (production)
 * - The Expo dev URL from getRedirectURL() in lib/auth.ts when testing in simulator (e.g. exp://192.168.x.x:8081/--/auth/callback).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      // PKCE: magic link returns ?code= (query survives the iOS Safari->app hop;
      // the old implicit flow returned tokens in the #fragment, which iOS drops).
      flowType: 'pkce',
    },
  });
}

export const supabase = client;

export function isSupabaseConfigured(): boolean {
  return client !== null;
}
