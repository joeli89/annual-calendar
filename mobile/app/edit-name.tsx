/**
 * Intent: Edit display name from Account, reusing the onboarding name step UI.
 */
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { EditFieldScreen } from '../components/EditFieldScreen';
import { InputField } from '../components/onboarding/InputField';
import {
  getOnboardingProfile,
  updateOnboardingProfile,
} from '../lib/profileApi';

const NAME_MAX = 50;

export default function EditNameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOnboardingProfile().then((p) => {
      if (!cancelled && p?.display_name) setName(p.display_name);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const valid = name.trim().length > 0 && name.trim().length <= NAME_MAX;

  const handleSave = async () => {
    if (busy || !valid) return;
    setBusy(true);
    setError(null);
    const { ok, error: err } = await updateOnboardingProfile({
      display_name: name.trim(),
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
      title="What’s your name?"
      subtitle="Allows us to get to know you"
      error={error}
      saveDisabled={!valid}
      busy={busy}
      onSave={() => void handleSave()}
    >
      <InputField
        value={name}
        onChangeText={setName}
        placeholder="What should we call you?"
        maxLength={NAME_MAX}
        autoFocus
        standalone
      />
    </EditFieldScreen>
  );
}
