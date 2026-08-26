/**
 * Intent: Edit favourite brands from Profile, reusing the onboarding step UI
 * (Figma 79:3331) — multi-select pills, same 1–6 selection rules.
 */
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import { EditFieldScreen } from '../components/EditFieldScreen';
import { PillTagList } from '../components/onboarding/PillTagList';
import {
  fetchWatchBrands,
  getOnboardingProfile,
  updateOnboardingProfile,
  type WatchBrand,
} from '../lib/profileApi';

const BRANDS_MAX = 6;

export default function EditBrandsScreen() {
  const router = useRouter();
  const [brands, setBrands] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<WatchBrand[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getOnboardingProfile(), fetchWatchBrands()]).then(
      ([profile, options]) => {
        if (cancelled) return;
        setBrandOptions(options);
        if (profile && profile.favorite_brands.length > 0) {
          setBrands(profile.favorite_brands);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleBrand = useCallback((slug: string) => {
    setBrands((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const valid = brands.length >= 1 && brands.length <= BRANDS_MAX;

  const handleSave = async () => {
    if (busy || !valid) return;
    setBusy(true);
    setError(null);
    const { ok, error: err } = await updateOnboardingProfile({
      favorite_brands: brands,
    });
    setBusy(false);
    if (!ok) {
      setError(err ?? 'Could not save. Please try again.');
      return;
    }
    router.back();
  };

  return (
    <EditFieldScreen
      title="What are your favourite brands?"
      subtitle="Select a minimum of 1"
      error={error}
      saveDisabled={!valid}
      busy={busy}
      onSave={() => void handleSave()}
    >
      <PillTagList
        options={brandOptions.map((b) => ({ value: b.slug, label: b.name }))}
        selected={brands}
        onToggle={toggleBrand}
        maxSelected={BRANDS_MAX}
      />
    </EditFieldScreen>
  );
}
