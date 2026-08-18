/**
 * Intent: Preserve a "save this event" intent across the auth/onboarding flow.
 * Why: The native auth sheet backgrounds the app and iOS may terminate it —
 * exactly when the user has invested the most effort. The intent is persisted
 * to AsyncStorage (not just React state) and flushed the moment a user session
 * appears, so the originally-intended event gets saved no matter which step
 * the user finished (or abandoned) on.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { track } from './analytics';
import { addFavorite } from './eventsApi';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'ac.pendingSave.v1';
/** Intents older than this are discarded rather than flushed. */
const MAX_INTENT_AGE_MS = 24 * 60 * 60 * 1000;

export type PendingSave = {
  eventId: string;
  source: string;
  createdAt: number;
};

export type FlushResult = {
  eventId: string;
  outcome: 'saved' | 'already_saved' | 'expired' | 'error';
  at: number;
};

type SaveIntentContextValue = {
  pendingSave: PendingSave | null;
  setPendingSave: (intent: { eventId: string; source: string }) => void;
  clearPendingSave: () => void;
  /** Idempotent: uses addFavorite (never toggleFavorite), so flushing against
   * an already-saved event does not un-save it. */
  flushPendingSave: () => Promise<FlushResult | null>;
  /** Last flush outcome — screens watch this to update UI (heart, toast). */
  lastFlushResult: FlushResult | null;
};

const SaveIntentContext = createContext<SaveIntentContextValue | null>(null);

function isFresh(intent: PendingSave): boolean {
  return Date.now() - intent.createdAt < MAX_INTENT_AGE_MS;
}

export function SaveIntentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [pendingSave, setPendingState] = useState<PendingSave | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [lastFlushResult, setLastFlushResult] = useState<FlushResult | null>(null);
  const flushing = useRef(false);

  // Restore a persisted intent on launch (covers the app being killed mid-OAuth).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as PendingSave;
          if (parsed?.eventId && isFresh(parsed)) {
            setPendingState(parsed);
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        // A corrupt stored intent should never block the app.
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPendingSave = useCallback(
    (intent: { eventId: string; source: string }) => {
      const full: PendingSave = { ...intent, createdAt: Date.now() };
      setPendingState(full);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(full)).catch(() => {});
    },
    []
  );

  const clearPendingSave = useCallback(() => {
    setPendingState(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const flushPendingSave = useCallback(async (): Promise<FlushResult | null> => {
    if (!pendingSave || !user || flushing.current) return null;
    flushing.current = true;
    try {
      if (!isFresh(pendingSave)) {
        const result: FlushResult = {
          eventId: pendingSave.eventId,
          outcome: 'expired',
          at: Date.now(),
        };
        track('save_intent_flushed', {
          event_id: pendingSave.eventId,
          outcome: 'expired',
        });
        clearPendingSave();
        setLastFlushResult(result);
        return result;
      }
      const saveResult = await addFavorite(pendingSave.eventId);
      const outcome: FlushResult['outcome'] = saveResult.error
        ? 'error'
        : saveResult.alreadyFavorited
          ? 'already_saved'
          : 'saved';
      const result: FlushResult = {
        eventId: pendingSave.eventId,
        outcome,
        at: Date.now(),
      };
      track('save_intent_flushed', {
        event_id: pendingSave.eventId,
        outcome,
      });
      // Keep the intent on transient errors so a later auth/retry can flush it.
      if (outcome !== 'error') {
        clearPendingSave();
      }
      setLastFlushResult(result);
      return result;
    } finally {
      flushing.current = false;
    }
  }, [pendingSave, user, clearPendingSave]);

  // Flush as soon as a session exists (sign-in completed, or app relaunched
  // with a restored session + restored intent). Firing on `user` becoming set
  // means the save happens regardless of which onboarding step the user
  // finished on — including dismissing the sheet right after auth.
  useEffect(() => {
    if (hydrated && user && pendingSave) {
      void flushPendingSave();
    }
  }, [hydrated, user, pendingSave, flushPendingSave]);

  return (
    <SaveIntentContext.Provider
      value={{
        pendingSave,
        setPendingSave,
        clearPendingSave,
        flushPendingSave,
        lastFlushResult,
      }}
    >
      {children}
    </SaveIntentContext.Provider>
  );
}

export function useSaveIntent(): SaveIntentContextValue {
  const ctx = useContext(SaveIntentContext);
  if (!ctx) {
    throw new Error('useSaveIntent must be used within SaveIntentProvider');
  }
  return ctx;
}
