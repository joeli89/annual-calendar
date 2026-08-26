/**
 * Intent: Edit location from Account, reusing the onboarding location step UI.
 */
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { EditFieldScreen } from '../components/EditFieldScreen';
import { InputField } from '../components/onboarding/InputField';
import {
  getOnboardingProfile,
  updateOnboardingProfile,
} from '../lib/profileApi';

const LOCATION_MAX = 100;

export default function EditLocationScreen() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOnboardingProfile().then((p) => {
      if (!cancelled && p?.location) setLocation(p.location);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const valid =
    location.trim().length > 0 && location.trim().length <= LOCATION_MAX;

  const handleSave = async () => {
    if (busy || !valid) return;
    setBusy(true);
    setError(null);
    const { ok, error: err } = await updateOnboardingProfile({
      location: location.trim(),
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
      title="Where are you from?"
      subtitle="Where do you live most of the time."
      error={error}
      saveDisabled={!valid}
      busy={busy}
      onSave={() => void handleSave()}
    >
      <InputField
        value={location}
        onChangeText={setLocation}
        placeholder="Where do you live most of the time?"
        maxLength={LOCATION_MAX}
        autoFocus
        standalone
      />
    </EditFieldScreen>
  );
}
