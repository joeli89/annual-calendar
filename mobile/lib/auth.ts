/**
 * Intent: Wrap Supabase auth for magic-link sign-in and session access.
 * Why: Single place for auth calls and redirect URL so screens stay simple.
 */
import * as Linking from 'expo-linking';
import { supabase, isSupabaseConfigured } from './supabase';

const PRODUCTION_REDIRECT = 'mobile://auth-callback';

export type SendMagicLinkResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Redirect URL Supabase puts in the magic link.
 * - Dev (Expo dev build / simulator): Linking.createURL('auth/callback') → exp://.../--/auth/callback
 * - Prod (native builds): mobile://auth-callback (custom scheme from app.json)
 *
 * Make sure BOTH values you see here are added to Supabase Dashboard →
 * Authentication → URL Configuration → Redirect URLs.
 */
export function getRedirectURL(): string {
  if (__DEV__) {
    return Linking.createURL('auth/callback');
  }
  return PRODUCTION_REDIRECT;
}

/**
 * Send a magic link to the given email. Uses an Expo dev URL in development
 * so the simulator receives the full URL, and mobile://auth-callback in production.
 */
export async function sendMagicLink(email: string): Promise<SendMagicLinkResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Auth is not configured' };
  }
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, error: 'Please enter your email' };
  }
  const redirectTo = getRedirectURL();
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Return the current session (and user) if any.
 */
export async function getCurrentSession() {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: { session: null, user: null } };
  }
  return supabase.auth.getSession();
}

/**
 * Subscribe to auth state changes (sign in / sign out / token refresh).
 */
export function onAuthStateChange(
  callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void
) {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {};
  }
  const { error } = await supabase.auth.signOut();
  return error ? { error: error.message } : {};
}

/**
 * Extract access_token and refresh_token from URL query string or hash fragment.
 * iOS often strips the fragment when opening custom URLs from Safari/Mail, so we support both.
 */
function getTokensFromUrl(url: string): { access_token: string | null; refresh_token: string | null } {
  try {
    // Query params (e.g. mobile://auth-callback?access_token=...&refresh_token=...)
    const queryStart = url.indexOf('?');
    if (queryStart !== -1) {
      const query = url.slice(queryStart + 1).split('#')[0];
      const params = new URLSearchParams(query);
      const at = params.get('access_token');
      const rt = params.get('refresh_token');
      if (at && rt) return { access_token: at, refresh_token: rt };
    }
    // Hash fragment (e.g. mobile:///#access_token=...&refresh_token=...)
    const hashStart = url.indexOf('#');
    if (hashStart !== -1) {
      const hash = url.slice(hashStart + 1);
      const params = new URLSearchParams(hash);
      const at = params.get('access_token');
      const rt = params.get('refresh_token');
      if (at && rt) return { access_token: at, refresh_token: rt };
    }
  } catch {
    // ignore
  }
  return { access_token: null, refresh_token: null };
}

/** True if URL is our auth callback (mobile:// or exp:// dev URL) with tokens in query or hash. */
function isOurAuthCallbackUrl(url: string | null): boolean {
  if (!url) return false;
  if (url.startsWith('mobile://') || url.startsWith('exp://')) {
    const { access_token, refresh_token } = getTokensFromUrl(url);
    return !!(access_token && refresh_token);
  }
  return false;
}

/**
 * Parse a magic-link redirect URL (query or hash with access_token, refresh_token) and set the session.
 * Accepts mobile:// (prod) and exp:// (Expo Go dev) URLs.
 */
export async function setSessionFromAuthUrl(url: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  if (!isOurAuthCallbackUrl(url)) return false;

  const { access_token, refresh_token } = getTokensFromUrl(url);
  if (!access_token || !refresh_token) return false;

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  return !error;
}

/**
 * True if the URL looks like a Supabase magic-link callback (mobile:// or exp:// with tokens in query or hash).
 */
export function isAuthCallbackUrl(url: string | null): boolean {
  return isOurAuthCallbackUrl(url);
}
