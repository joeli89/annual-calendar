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

const MAX_IMAGES = 20;

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
  image_urls: [] as string[],
  website_url: '',
  instagram_url: '',
  x_url: '',
  host_name: '',
  host_logo_url: '',
  visibility: 'public',
  access_type: 'free',
  exhibiting_brands: '',
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
    hero_image_url: row.hero_image_url ?? '',
    image_urls: row.image_urls ?? [],
    website_url: row.website_url ?? '',
    instagram_url: row.instagram_url ?? '',
    x_url: row.x_url ?? '',
    host_name: row.host_name ?? '',
    host_logo_url: row.host_logo_url ?? '',
    visibility: row.visibility ?? 'public',
    access_type: row.access_type ?? 'free',
    exhibiting_brands: (row.exhibiting_brands ?? []).join('\n'),
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Combined list: hero first, then image_urls (for display and count). Max MAX_IMAGES. */
  const allImageUrls = [
    ...(form.hero_image_url ? [form.hero_image_url] : []),
    ...form.image_urls,
  ].slice(0, MAX_IMAGES);
  const canAddMore = allImageUrls.length < MAX_IMAGES;

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

  async function handleImageUpload(file: File) {
    if (allImageUrls.length >= MAX_IMAGES) return;
    setUploadError(null);
    setUploading(true);
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
      if (!form.hero_image_url) {
        update('hero_image_url', publicUrl);
      } else {
        update('image_urls', [...form.image_urls, publicUrl]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    if (index === 0) {
      if (form.image_urls.length > 0) {
        update('hero_image_url', form.image_urls[0]);
        update('image_urls', form.image_urls.slice(1));
      } else {
        update('hero_image_url', '');
      }
    } else {
      const newSide = form.image_urls.filter((_, i) => i !== index - 1);
      update('image_urls', newSide);
    }
  }

  /** Reorder images: apply new order to form (hero = first, rest = image_urls). */
  function reorderImages(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const reordered = [...allImageUrls];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);
    setForm((prev) => ({
      ...prev,
      hero_image_url: reordered[0] ?? '',
      image_urls: reordered.slice(1),
    }));
    setDraggedIndex(null);
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
      host_name: form.host_name.trim() || null,
      host_logo_url: form.host_logo_url.trim() || null,
      visibility: form.visibility,
      access_type: form.access_type,
      exhibiting_brands: form.exhibiting_brands
        .split(/[\n,]/)
        .map((b) => b.trim())
        .filter(Boolean),
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
          <h2 className={styles.sectionTitle}>Host &amp; entry</h2>
          <label className={styles.label}>
            Host name
            <input
              value={form.host_name}
              onChange={(e) => update('host_name', e.target.value)}
              placeholder="Watches &amp; Wonders Geneva"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Host logo URL
            <input
              type="url"
              value={form.host_logo_url}
              onChange={(e) => update('host_logo_url', e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Visibility
            <select
              value={form.visibility}
              onChange={(e) => update('visibility', e.target.value)}
              className={styles.input}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label className={styles.label}>
            Entry
            <select
              value={form.access_type}
              onChange={(e) => update('access_type', e.target.value)}
              className={styles.input}
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
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
            Address line 1
            <input
              value={form.address_line1}
              onChange={(e) => update('address_line1', e.target.value)}
              placeholder="Quai du Seujet 36"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            City
            <input
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="Genève"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Country
            <input
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              placeholder="Switzerland"
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
          <h2 className={styles.sectionTitle}>Images</h2>
          {uploadError && (
            <p className={styles.uploadError} role="alert">
              {uploadError}
            </p>
          )}
          <div className={styles.uploadArea}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.fileInput}
              disabled={!canAddMore || uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(f);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className={styles.uploadButton}
              disabled={!canAddMore || uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'Uploading…' : `Upload image${canAddMore ? ` (${allImageUrls.length}/${MAX_IMAGES})` : ''}`}
            </button>
          </div>
          {allImageUrls.length > 0 && (
            <div className={styles.imageGrid} role="list">
              {allImageUrls.map((url, index) => (
                <div
                  key={url}
                  className={`${styles.imageGridItem} ${draggedIndex === index ? styles.imageGridItemDragging : ''}`}
                  role="listitem"
                  draggable
                  onDragStart={(e) => {
                    setDraggedIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', String(index));
                  }}
                  onDragEnd={() => setDraggedIndex(null)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIndex === null) return;
                    reorderImages(draggedIndex, index);
                  }}
                >
                  <img
                    src={url}
                    alt={index === 0 ? 'Hero' : `Image ${index + 1}`}
                    className={styles.imagePreview}
                    draggable={false}
                  />
                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={() => removeImage(index)}
                    title="Remove image"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Exhibiting brands</h2>
          <label className={styles.label}>
            Brand names (comma or new-line separated)
            <textarea
              value={form.exhibiting_brands}
              onChange={(e) => update('exhibiting_brands', e.target.value)}
              rows={4}
              placeholder={'Rolex\nPatek Philippe\nAudemars Piguet'}
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
