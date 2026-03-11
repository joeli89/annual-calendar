import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { EventRow } from '../types/events';
import styles from './EventFormPage.module.css';

const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'event-images';

function getExtension(filename: string): string {
  const m = filename.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : 'jpg';
}

const emptyForm = {
  slug: '',
  title: '',
  description: '',
  start_at: '',
  end_at: '',
  is_all_day: true,
  display_date_range: '',
  location_name: '',
  address_line1: '',
  address_line2: '',
  city: '',
  region: '',
  country: '',
  latitude: '',
  longitude: '',
  hero_image_url: '',
  image_urls: ['', ''],
  website_url: '',
  instagram_url: '',
  x_url: '',
  tags: [] as string[],
  is_published: true,
};

function toFormRow(row: EventRow) {
  return {
    ...emptyForm,
    slug: row.slug,
    title: row.title,
    description: row.description,
    start_at: row.start_at.slice(0, 16),
    end_at: row.end_at.slice(0, 16),
    is_all_day: row.is_all_day,
    display_date_range: row.display_date_range,
    location_name: row.location_name,
    address_line1: row.address_line1 ?? '',
    address_line2: row.address_line2 ?? '',
    city: row.city ?? '',
    region: row.region ?? '',
    country: row.country ?? '',
    latitude: row.latitude != null ? String(row.latitude) : '',
    longitude: row.longitude != null ? String(row.longitude) : '',
    hero_image_url: row.hero_image_url,
    image_urls: [...(row.image_urls ?? []), '', ''].slice(0, 2),
    website_url: row.website_url ?? '',
    instagram_url: row.instagram_url ?? '',
    x_url: row.x_url ?? '',
    tags: row.tags ?? [],
    is_published: row.is_published,
  };
}

type FormState = ReturnType<typeof toFormRow>;

export function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'hero' | 'side0' | 'side1' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const side0InputRef = useRef<HTMLInputElement>(null);
  const side1InputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error: e } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }
      setForm(toFormRow(data as EventRow));
      setLoading(false);
    })();
  }, [id, isNew]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(
    file: File,
    field: 'hero' | 'side0' | 'side1'
  ) {
    setUploadError(null);
    setUploading(field);
    const ext = getExtension(file.name);
    const path = `events/${crypto.randomUUID()}.${ext}`;
    try {
      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadErr) throw uploadErr;
      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      if (field === 'hero') {
        update('hero_image_url', publicUrl);
      } else {
        const idx = field === 'side0' ? 0 : 1;
        update('image_urls', [
          idx === 0 ? publicUrl : form.image_urls[0],
          idx === 1 ? publicUrl : form.image_urls[1],
        ]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const tags = typeof form.tags === 'string'
      ? (form.tags as string).split(',').map((t) => t.trim()).filter(Boolean)
      : form.tags;
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      start_at: new Date(form.start_at).toISOString(),
      end_at: new Date(form.end_at).toISOString(),
      is_all_day: form.is_all_day,
      display_date_range: form.display_date_range.trim(),
      location_name: form.location_name.trim(),
      address_line1: form.address_line1.trim() || null,
      address_line2: form.address_line2.trim() || null,
      city: form.city.trim() || null,
      region: form.region.trim() || null,
      country: form.country.trim() || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      hero_image_url: form.hero_image_url.trim(),
      image_urls: form.image_urls.map((u) => u.trim()).filter(Boolean),
      website_url: form.website_url.trim() || null,
      instagram_url: form.instagram_url.trim() || null,
      x_url: form.x_url.trim() || null,
      tags,
      is_published: form.is_published,
    };

    try {
      if (isNew) {
        const { data: inserted, error: insertErr } = await supabase
          .from('events')
          .insert(payload)
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        const eventId = (inserted as { id: string }).id;
        const { data: cal } = await supabase
          .from('calendars')
          .select('id')
          .eq('slug', 'default')
          .single();
        if (cal) {
          await supabase.from('calendar_events').insert({
            calendar_id: (cal as { id: string }).id,
            event_id: eventId,
          });
        }
        navigate('/events', { replace: true });
      } else {
        const { error: updateErr } = await supabase
          .from('events')
          .update(payload)
          .eq('id', id!);
        if (updateErr) throw updateErr;
        navigate('/events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading && !isNew) {
    return <p className={styles.status}>Loading event…</p>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/events" className={styles.back}>
          ← Events
        </Link>
        <h1 className={styles.title}>{isNew ? 'New event' : 'Edit event'}</h1>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Basics</h2>
          <label className={styles.label}>
            Slug (unique URL id)
            <input
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              required
              placeholder="my-event-2026"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Title
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Description
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              required
              rows={4}
              className={styles.input}
            />
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => update('is_published', e.target.checked)}
            />
            Published (visible in app)
          </label>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dates</h2>
          <label className={styles.label}>
            Display date range (e.g. “24th to 26th February 2026”)
            <input
              value={form.display_date_range}
              onChange={(e) => update('display_date_range', e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Start (UTC)
            <input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) => update('start_at', e.target.value)}
              required
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            End (UTC)
            <input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) => update('end_at', e.target.value)}
              required
              className={styles.input}
            />
          </label>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Location</h2>
          <label className={styles.label}>
            Location name
            <input
              value={form.location_name}
              onChange={(e) => update('location_name', e.target.value)}
              required
              placeholder="Geneva, Switzerland"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Latitude
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => update('latitude', e.target.value)}
              placeholder="46.2044"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Longitude
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => update('longitude', e.target.value)}
              placeholder="6.1432"
              className={styles.input}
            />
          </label>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Images (URLs or upload)</h2>
          {uploadError && (
            <p className={styles.uploadError} role="alert">
              {uploadError}
            </p>
          )}
          <label className={styles.label}>
            Hero image URL
            <div className={styles.imageRow}>
              <input
                type="url"
                value={form.hero_image_url}
                onChange={(e) => update('hero_image_url', e.target.value)}
                required
                placeholder="https://…"
                className={styles.input}
              />
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f, 'hero');
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                className={styles.uploadButton}
                disabled={uploading !== null}
                onClick={() => heroInputRef.current?.click()}
              >
                {uploading === 'hero' ? 'Uploading…' : 'Upload'}
              </button>
            </div>
            {form.hero_image_url && (
              <img
                src={form.hero_image_url}
                alt="Hero preview"
                className={styles.imagePreview}
              />
            )}
          </label>
          <label className={styles.label}>
            Side image 1
            <div className={styles.imageRow}>
              <input
                type="url"
                value={form.image_urls[0]}
                onChange={(e) =>
                  update('image_urls', [e.target.value, form.image_urls[1]])
                }
                placeholder="https://…"
                className={styles.input}
              />
              <input
                ref={side0InputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f, 'side0');
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                className={styles.uploadButton}
                disabled={uploading !== null}
                onClick={() => side0InputRef.current?.click()}
              >
                {uploading === 'side0' ? 'Uploading…' : 'Upload'}
              </button>
            </div>
            {form.image_urls[0] && (
              <img
                src={form.image_urls[0]}
                alt="Side 1 preview"
                className={styles.imagePreview}
              />
            )}
          </label>
          <label className={styles.label}>
            Side image 2
            <div className={styles.imageRow}>
              <input
                type="url"
                value={form.image_urls[1]}
                onChange={(e) =>
                  update('image_urls', [form.image_urls[0], e.target.value])
                }
                placeholder="https://…"
                className={styles.input}
              />
              <input
                ref={side1InputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f, 'side1');
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                className={styles.uploadButton}
                disabled={uploading !== null}
                onClick={() => side1InputRef.current?.click()}
              >
                {uploading === 'side1' ? 'Uploading…' : 'Upload'}
              </button>
            </div>
            {form.image_urls[1] && (
              <img
                src={form.image_urls[1]}
                alt="Side 2 preview"
                className={styles.imagePreview}
              />
            )}
          </label>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Links</h2>
          <label className={styles.label}>
            Website URL
            <input
              type="url"
              value={form.website_url}
              onChange={(e) => update('website_url', e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Instagram URL
            <input
              type="url"
              value={form.instagram_url}
              onChange={(e) => update('instagram_url', e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            X (Twitter) URL
            <input
              type="url"
              value={form.x_url}
              onChange={(e) => update('x_url', e.target.value)}
              className={styles.input}
            />
          </label>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tags</h2>
          <label className={styles.label}>
            Comma-separated tags
            <input
              value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
              onChange={(e) =>
                update(
                  'tags',
                  e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                )
              }
              placeholder="watch-fair, geneva"
              className={styles.input}
            />
          </label>
        </section>

        <div className={styles.actions}>
          <button type="submit" disabled={saving} className={styles.submit}>
            {saving ? 'Saving…' : isNew ? 'Create event' : 'Save changes'}
          </button>
          {!isNew && (
            <Link to="/events" className={styles.cancel}>
              Cancel
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
