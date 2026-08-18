/**
 * Intent: Typed funnel analytics for the save-triggered onboarding flow.
 * Why: The flow sits directly in front of the North Star (Weekly Active Savers);
 * per-step drop-off must be measurable from day one. Events are written to
 * public.analytics_events (insert-only for clients) so drop-off is queryable
 * in SQL without adding a third-party SDK.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase, isSupabaseConfigured } from './supabase';

/** Event payloads, keyed by event name. Keep in sync with the funnel spec. */
export type AnalyticsEventMap = {
  save_intent_started: { event_id: string; source: string };
  onboarding_viewed: { step: string };
  auth_attempted: { provider: 'apple' | 'google' };
  auth_succeeded: { provider: 'apple' | 'google' };
  auth_failed: { provider: 'apple' | 'google'; error_code: string };
  onboarding_step_completed: { step: string };
  onboarding_abandoned: { last_step: string };
  onboarding_completed: { duration_ms: number };
  save_intent_flushed: {
    event_id: string;
    outcome: 'saved' | 'already_saved' | 'expired' | 'error';
  };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

const DEVICE_ID_KEY = 'ac.analytics.deviceId.v1';

let cachedDeviceId: string | null = null;

/** Stable anonymous id so pre-auth and post-auth funnel steps join up. */
async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) {
      cachedDeviceId = existing;
      return existing;
    }
    const fresh = `dev_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, fresh);
    cachedDeviceId = fresh;
    return fresh;
  } catch {
    return 'dev_unknown';
  }
}

/**
 * Fire-and-forget funnel event. Never throws and never blocks the UI;
 * analytics failures must not affect the save/onboarding flow.
 */
export function track<N extends AnalyticsEventName>(
  name: N,
  props: AnalyticsEventMap[N]
): void {
  void (async () => {
    try {
      if (__DEV__) {
        console.log(`[analytics] ${name}`, props);
      }
      if (!isSupabaseConfigured() || !supabase) return;
      const deviceId = await getDeviceId();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from('analytics_events').insert({
        event: name,
        props,
        device_id: deviceId,
        user_id: user?.id ?? null,
      });
      if (error && __DEV__) {
        console.warn('[analytics] insert failed', error.message);
      }
    } catch (e) {
      if (__DEV__) console.warn('[analytics] track failed', e);
    }
  })();
}
