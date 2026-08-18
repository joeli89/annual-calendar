/**
 * Intent: Read/write the onboarding slice of public.profiles + watch brands.
 * Why: One place for onboarding persistence. Each step writes its own small
 * UPDATE (never INSERT — the on_auth_user_created trigger creates the row),
 * so a user who drops at step 5 keeps their first four answers and resumes.
 */
import { supabase, isSupabaseConfigured } from './supabase';

export type OnboardingProfile = {
  display_name: string | null;
  date_of_birth: string | null; // ISO date (YYYY-MM-DD)
  location: string | null;
  collection_size: string | null; // '0' | '1-3' | '4-8' | '9+'
  favorite_brands: string[];
  onboarding_completed_at: string | null;
};

export type WatchBrand = {
  id: string;
  slug: string;
  name: string;
  sort_order: number | null;
};

export const COLLECTION_SIZES = ['0', '1-3', '4-8', '9+'] as const;

/** Fetch the current user's onboarding profile fields. Null when signed out. */
export async function getOnboardingProfile(): Promise<OnboardingProfile | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'display_name, date_of_birth, location, collection_size, favorite_brands, onboarding_completed_at'
    )
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.warn('Supabase getOnboardingProfile error:', error);
    return null;
  }
  if (!data) {
    // Trigger creates the row on signup; a missing row means replication lag.
    // Treat as an empty profile so onboarding starts at the first step.
    return {
      display_name: null,
      date_of_birth: null,
      location: null,
      collection_size: null,
      favorite_brands: [],
      onboarding_completed_at: null,
    };
  }
  return {
    ...data,
    favorite_brands: Array.isArray(data.favorite_brands)
      ? data.favorite_brands
      : [],
  } as OnboardingProfile;
}

/**
 * Persist one step's answer. Small single-column UPDATE per Continue tap.
 * Server-side CHECK constraints reject invalid values regardless of UI state.
 */
export async function updateOnboardingProfile(
  patch: Partial<
    Pick<
      OnboardingProfile,
      | 'display_name'
      | 'date_of_birth'
      | 'location'
      | 'collection_size'
      | 'favorite_brands'
    >
  >
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Not configured' };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };
  const { error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);
  if (error) {
    console.warn('Supabase updateOnboardingProfile error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Stamp onboarding as complete so the flow is skipped entirely next time. */
export async function completeOnboarding(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Not configured' };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };
  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);
  if (error) {
    console.warn('Supabase completeOnboarding error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Brands for the favourite-brands step. Never hardcoded in the client. */
export async function fetchWatchBrands(): Promise<WatchBrand[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('watch_brands')
    .select('id, slug, name, sort_order')
    .order('sort_order', { ascending: true, nullsFirst: false });
  if (error) {
    console.warn('Supabase fetchWatchBrands error:', error);
    return [];
  }
  return (data ?? []) as WatchBrand[];
}
