import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { supabase } from '../lib/supabaseClient';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  }

  return (
    <AuthGuard>
      <div className={styles.layout}>
        <header className={styles.header}>
          <Link to="/events" className={styles.logo}>
            Annual Calendar CMS
          </Link>
          <nav className={styles.nav}>
            {email && <span className={styles.email}>{email}</span>}
            <button type="button" className={styles.logout} onClick={handleLogout}>
              Sign out
            </button>
          </nav>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </AuthGuard>
  );
}
