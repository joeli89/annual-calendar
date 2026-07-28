/**
 * Intent: Fetch events and favorites from Supabase and map to app Event type.
 * Why: Single place for Supabase queries and fallback to mock data when not configured.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { events as mockEvents } from '../data/events';
import type { Event } from '../types/event';

/** DB row shape from public.events (snake_case). */
export type EventsRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  is_all_day: boolean;
  display_date_range: string;
  location_name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  hero_image_url: string;
  image_urls: string[];
  website_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  tags: string[];
  is_published: boolean;
  visibility: string | null;
  access_type: string | null;
  social_links: Record<string, string> | null;
  host_name: string | null;
  host_logo_url: string | null;
  exhibiting_brands: string[] | null;
};

const MAP_IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=200&q=80';

function formatAddress(row: EventsRow): string {
  const parts = [row.address_line1, row.city, row.country].filter(
    (p): p is string => !!p && p.trim().length > 0
  );
  return parts.length ? parts.join(', ') : row.location_name;
}

function rowToEvent(row: EventsRow): Event {
  const start = new Date(row.start_at);
  const sideUrls = Array.isArray(row.image_urls) ? row.image_urls : [];
  const sideImageUrls: [string, string] = [
    sideUrls[0] ?? row.hero_image_url,
    sideUrls[1] ?? row.hero_image_url,
  ];
  const imageUrls = [row.hero_image_url, ...sideUrls].filter(
    (u): u is string => !!u
  );
  return {
    id: row.id,
    title: row.title,
    dateRange: row.display_date_range,
    location: row.location_name,
    description: row.description,
    mainImageUrl: row.hero_image_url,
    sideImageUrls,
    mapImageUrl: MAP_IMAGE_PLACEHOLDER,
    month: start.getMonth() + 1,
    year: start.getFullYear(),
    ...(row.latitude != null && row.longitude != null
      ? { latitude: row.latitude, longitude: row.longitude }
      : {}),
    imageUrls,
    address: formatAddress(row),
    hostName: row.host_name,
    hostLogoUrl: row.host_logo_url,
    visibility: row.visibility === 'private' ? 'private' : 'public',
    accessType: row.access_type === 'paid' ? 'paid' : 'free',
    websiteUrl: row.website_url,
    instagramUrl: row.instagram_url,
    xUrl: row.x_url,
    startAt: row.start_at,
    endAt: row.end_at,
    isAllDay: row.is_all_day,
    exhibitingBrands: Array.isArray(row.exhibiting_brands)
      ? row.exhibiting_brands
      : [],
  };
}

/**
 * Fetch all published events from Supabase, ordered by start_at.
 * Falls back to mock events when Supabase is not configured.
 */
export async function fetchEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return Promise.resolve(mockEvents);
  }
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('start_at', { ascending: true });
  if (error) {
    console.warn('Supabase fetchEvents error:', error);
    return mockEvents;
  }
  return (data as EventsRow[]).map(rowToEvent);
}

/**
 * Fetch a single event by id (UUID string).
 * Falls back to mock events lookup when Supabase is not configured.
 */
export async function fetchEventById(id: string): Promise<Event | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return mockEvents.find((e) => e.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();
  if (error) {
    console.warn('Supabase fetchEventById error:', error);
    return mockEvents.find((e) => e.id === id) ?? null;
  }
  return data ? rowToEvent(data as EventsRow) : null;
}

/**
 * Return set of event IDs favorited by the current user.
 * Returns empty set when not configured or not authenticated.
 */
export async function getFavoriteEventIds(): Promise<Set<string>> {
  if (!isSupabaseConfigured() || !supabase) {
    return new Set();
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data, error } = await supabase
    .from('favorites')
    .select('event_id')
    .eq('user_id', user.id);
  if (error) {
    console.warn('Supabase getFavoriteEventIds error:', error);
    return new Set();
  }
  return new Set((data ?? []).map((r: { event_id: string }) => r.event_id));
}

/**
 * Toggle favorite for the current user and event.
 * No-op when Supabase not configured or not authenticated.
 * Returns new favorited state (true = favorited).
 */
export async function toggleFavorite(
  eventId: string
): Promise<{ favorited: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { favorited: false };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { favorited: false, error: 'Not authenticated' };
  }
  const { data: existing } = await supabase
    .from('favorites')
    .select('event_id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);
    if (error) {
      console.warn('Supabase unfavorite error:', error);
      return { favorited: true, error: error.message };
    }
    return { favorited: false };
  }
  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    event_id: eventId,
  });
  if (error) {
    console.warn('Supabase favorite error:', error);
    return { favorited: false, error: error.message };
  }
  return { favorited: true };
}

/**
 * Check if an event is favorited by the current user.
 */
export async function isEventFavorited(eventId: string): Promise<boolean> {
  const ids = await getFavoriteEventIds();
  return ids.has(eventId);
}
