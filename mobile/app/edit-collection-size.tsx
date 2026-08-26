/**
 * Intent: Edit collection size from Profile, reusing the onboarding step UI
 * (Figma 81:3483) — wheel picker + primary CTA on a light sheet.
 */
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { EditFieldScreen } from '../components/EditFieldScreen';
import { WheelPicker } from '../components/onboarding/WheelPicker';
import {
  COLLECTION_SIZES,
  getOnboardingProfile,
  updateOnboardingProfile,
} from '../lib/profileApi';

export default function EditCollectionSizeScreen() {
  const router = useRouter();
  const [collectionSize, setCollectionSize] = useState('1-3');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOnboardingProfile().then((p) => {
      if (!cancelled && p?.collection_size) setCollectionSize(p.collection_size);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const { ok, error: err } = await updateOnboardingProfile({
      collection_size: collectionSize,
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
      title="How many watches do you have in your collection?"
      error={error}
      busy={busy}
      onSave={() => void handleSave()}
    >
      <WheelPicker
        columns={[
          {
            key: 'collection',
            items: COLLECTION_SIZES.map((v) => ({ label: v, value: v })),
            selectedValue: collectionSize,
            onValueChange: setCollectionSize,
          },
        ]}
      />
    </EditFieldScreen>
  );
}
