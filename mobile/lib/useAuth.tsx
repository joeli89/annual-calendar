/**
 * Intent: Expose auth state app-wide via React context.
 * Why: Screens can gate behavior (Saved, Profile, favorite toggle) without duplicating Supabase calls.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { getCurrentSession, onAuthStateChange } from './auth';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await getCurrentSession();
    setSession(data.session);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await getCurrentSession();
      if (!cancelled) {
        setSession(data.session);
      }
      if (!cancelled) {
        setLoading(false);
      }
    })();

    const { data: { subscription } } = onAuthStateChange((_event, newSession) => {
      if (!cancelled) {
        setSession(newSession);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      refresh,
    }),
    [session, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
