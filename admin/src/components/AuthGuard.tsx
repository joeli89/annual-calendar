import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type Profile = { user_id: string; is_admin: boolean };

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'forbidden' | 'unauthenticated'>('loading');

  const check = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setStatus('unauthenticated');
      navigate('/login', { state: { from: location.pathname }, replace: true });
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, is_admin')
      .eq('user_id', user.id)
      .single();
    if (profileError || !profile) {
      setStatus('unauthenticated');
      navigate('/login', { state: { from: location.pathname }, replace: true });
      return;
    }
    const p = profile as Profile;
    if (!p.is_admin) {
      setStatus('forbidden');
      return;
    }
    setStatus('allowed');
  }, [navigate, location.pathname]);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    return () => subscription.unsubscribe();
  }, [check]);

  if (status === 'loading') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading…
      </div>
    );
  }

  if (status === 'forbidden') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>You are not an admin.</p>
        <p>Ask an administrator to set your account as admin in the Supabase Table Editor (profiles.is_admin = true).</p>
        <button type="button" onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}>
          Sign out
        </button>
      </div>
    );
  }

  if (status === 'allowed') {
    return <>{children}</>;
  }

  return null;
}
