import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { EventRow } from '../types/events';
import styles from './EventsListPage.module.css';

export function EventsListPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: e } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: true });
      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }
      setEvents((data ?? []) as EventRow[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete event "${title}"? This cannot be undone.`)) return;
    const { error: e } = await supabase.from('events').delete().eq('id', id);
    if (e) {
      setError(e.message);
      return;
    }
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }

  if (loading) {
    return <p className={styles.status}>Loading events…</p>;
  }

  if (error) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Events</h1>
        <Link to="/events/new" className={styles.newButton}>
          New event
        </Link>
      </div>
      {events.length === 0 ? (
        <p className={styles.empty}>No events yet. Create one to get started.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Start</th>
                <th>End</th>
                <th>Location</th>
                <th>Published</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.title}</td>
                  <td>{new Date(ev.start_at).toLocaleDateString()}</td>
                  <td>{new Date(ev.end_at).toLocaleDateString()}</td>
                  <td>{ev.location_name}</td>
                  <td>{ev.is_published ? 'Yes' : 'No'}</td>
                  <td>
                    <Link to={`/events/${ev.id}`} className={styles.link}>
                      Edit
                    </Link>
                    {' · '}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(ev.id, ev.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
