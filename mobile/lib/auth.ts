/**
 * Intent: Wrap Supabase auth for magic-link sign-in and session access.
 * Why: Single place for auth calls and the redirect URL so screens stay simple.
 *
 * Flow: PKCE. The magic link redirects back to the app as
 *   mobile://auth-callback?code=<code>
 * and we finish sign-in with supabase.auth.exchangeCodeForSession(code).
 * Query params survive the Safari->app hop on iOS; URL #fragments often don't,
 * which is why the older implicit/token flow failed in the TestFlight build.
 */
import * as Linking from 'expo-linking';
import { supabase, isSupabaseConfigured } from './supabase';

const PRODUCTION_REDIRECT = 'mobile://auth-callback';

export type SendMagicLinkResult = { ok: true } | { ok: false; error: string };

/**
 * Redirect URL Supabase puts in the magic link. Add BOTH to Supabase Dashboard →
 * Authentication → URL Configuration → Redirect URLs:
 * - Dev (Expo dev build / simulator): Linking.createURL('auth/callback') → exp://.../--/auth/callback
 * - Prod (native builds): mobile://auth-callback
 */
export function getRedirectURL(): string {
  if (__DEV__) return Linking.createURL('auth/callback');
  return PRODUCTION_REDIRECT;
}

/** Send a magic link to the given email. */
export async function sendMagicLink(email: string): Promise<SendMagicLinkResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Auth is not configured' };
  }
  const trimmed = email.trim();
  if (!trimmed) return { ok: false, error: 'Please enter your email' };

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: { emailRedirectTo: getRedirectURL() },
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Return the current session (and user) if any. */
export async function getCurrentSession() {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: { session: null, user: null } };
  }
  return supabase.auth.getSession();
}

/** Subscribe to auth state changes (sign in / sign out / token refresh). */
export function onAuthStateChange(
  callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void
) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((event, session) => callback(event, session));
}

/** Sign out the current user. */
export async function signOut(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !supabase) return {};
  const { error } = await supabase.auth.signOut();
  return error ? { error: error.message } : {};
}

// ---------- magic-link callback parsing ----------

/** Read a param from either the query string or the hash fragment of a URL. */
function getParam(url: string, key: string): string | null {
  try {
    const q = url.indexOf('?');
    if (q !== -1) {
      const query = url.slice(q + 1).split('#')[0];
      const v = new URLSearchParams(query).get(key);
      if (v) return v;
    }
    const h = url.indexOf('#');
    if (h !== -1) {
      const v = new URLSearchParams(url.slice(h + 1)).get(key);
      if (v) return v;
    }
  } catch {
    // ignore malformed URLs
  }
  return null;
}

function getCodeFromUrl(url: string): string | null {
  return getParam(url, 'code');
}

function getTokensFromUrl(url: string): {
  access_token: string | null;
  refresh_token: string | null;
} {
  return {
    access_token: getParam(url, 'access_token'),
    refresh_token: getParam(url, 'refresh_token'),
  };
}

/** True if URL is our auth callback with either a PKCE ?code= or implicit tokens. */
function isOurAuthCallbackUrl(url: string | null): boolean {
  if (!url) return false;
  if (!url.startsWith('mobile://') && !url.startsWith('exp://')) return false;
  if (getCodeFromUrl(url)) return true;
  const { access_token, refresh_token } = getTokensFromUrl(url);
  return !!(access_token && refresh_token);
}

/** True if the URL looks like a Supabase magic-link callback for this app. */
export function isAuthCallbackUrl(url: string | null): boolean {
  return isOurAuthCallbackUrl(url);
}

// A PKCE code is single-use. Both the root DeepLinkHandler and the auth-callback
// route can fire for the same URL, so guard against exchanging a code twice.
const handledCodes = new Set<string>();

/**
 * Complete sign-in from a magic-link redirect URL.
 * PKCE: exchange ?code= for a session. Fallback: set session from implicit tokens.
 */
export async function setSessionFromAuthUrl(url: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  if (!isOurAuthCallbackUrl(url)) return false;

  const code = getCodeFromUrl(url);
  if (code) {
    if (handledCodes.has(code)) return true; // already exchanged by the other handler
    handledCodes.add(code);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      handledCodes.delete(code);
      return false;
    }
    return true;
  }

  // Fallback for implicit-flow tokens (e.g. Expo Go dev, or older links).
  const { access_token, refresh_token } = getTokensFromUrl(url);
  if (!access_token || !refresh_token) return false;
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  return !error;
}
