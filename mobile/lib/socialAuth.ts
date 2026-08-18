/**
 * Intent: Native social sign-in (Apple + Google) via supabase.auth.signInWithIdToken.
 * Why: Native SDKs hand us an ID token in-process — no Safari->app deep-link hop.
 * The previous browser-redirect auth broke because iOS drops URL #fragments on
 * that hop; this path avoids it entirely.
 *
 * Config required for a native build (NOT OTA-able):
 * - Apple: "usesAppleSignIn" in app.json (adds the Sign In with Apple
 *   capability/entitlement) + Apple provider enabled in the Supabase dashboard.
 * - Google: iOS client ID (EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) + reversed client
 *   ID URL scheme via the google-signin config plugin in app.json + Web client
 *   ID (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) registered in the Supabase dashboard.
 */
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { supabase, isSupabaseConfigured } from './supabase';

export type SocialAuthResult =
  | {
      ok: true;
      /** Apple returns the full name ONLY on first authorisation — callers
       * should capture it immediately and prefill the name step. */
      fullName: string | null;
    }
  | {
      ok: false;
      /** 'cancelled' = user backed out (not an error state in the UI). */
      code: 'cancelled' | 'unavailable' | 'failed';
      error: string;
    };

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let googleConfigured = false;

function configureGoogle(): boolean {
  if (googleConfigured) return true;
  if (!GOOGLE_WEB_CLIENT_ID) return false;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    ...(Platform.OS === 'ios' && GOOGLE_IOS_CLIENT_ID
      ? { iosClientId: GOOGLE_IOS_CLIENT_ID }
      : {}),
  });
  googleConfigured = true;
  return true;
}

function joinName(
  given?: string | null,
  family?: string | null
): string | null {
  const name = [given, family].filter(Boolean).join(' ').trim();
  return name.length > 0 ? name : null;
}

/** Sign in with Apple natively and exchange the identity token with Supabase. */
export async function signInWithApple(): Promise<SocialAuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, code: 'unavailable', error: 'Auth is not configured' };
  }
  if (Platform.OS !== 'ios') {
    return {
      ok: false,
      code: 'unavailable',
      error: 'Apple sign-in is only available on iOS',
    };
  }
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) {
      return { ok: false, code: 'failed', error: 'No identity token returned' };
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    if (error) {
      return { ok: false, code: 'failed', error: error.message };
    }
    // Full name is only present on the FIRST authorisation for this Apple ID.
    return {
      ok: true,
      fullName: joinName(
        credential.fullName?.givenName,
        credential.fullName?.familyName
      ),
    };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err.code === 'ERR_REQUEST_CANCELED') {
      return { ok: false, code: 'cancelled', error: 'Sign-in cancelled' };
    }
    return {
      ok: false,
      code: 'failed',
      error: err.message ?? 'Apple sign-in failed',
    };
  }
}

/** Sign in with Google natively and exchange the ID token with Supabase. */
export async function signInWithGoogle(): Promise<SocialAuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, code: 'unavailable', error: 'Auth is not configured' };
  }
  if (!configureGoogle()) {
    return {
      ok: false,
      code: 'unavailable',
      error: 'Google sign-in is not configured (missing client IDs)',
    };
  }
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      // Non-success without a thrown error means the user cancelled the sheet.
      return { ok: false, code: 'cancelled', error: 'Sign-in cancelled' };
    }
    const idToken = response.data.idToken;
    if (!idToken) {
      return { ok: false, code: 'failed', error: 'No ID token returned' };
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) {
      return { ok: false, code: 'failed', error: error.message };
    }
    return { ok: true, fullName: response.data.user.name ?? null };
  } catch (e: unknown) {
    if (isErrorWithCode(e)) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        return { ok: false, code: 'cancelled', error: 'Sign-in cancelled' };
      }
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          ok: false,
          code: 'unavailable',
          error: 'Google Play Services not available',
        };
      }
    }
    const err = e as { message?: string };
    return {
      ok: false,
      code: 'failed',
      error: err.message ?? 'Google sign-in failed',
    };
  }
}
