/**
 * Intent: Edit date of birth from Account, reusing the onboarding DOB step UI
 * (three-column wheel, 18+ rule, privacy note).
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EditFieldScreen } from '../components/EditFieldScreen';
import {
  MONTHS,
  daysInMonth,
  isAtLeast18,
  toIsoDate,
} from '../components/onboarding/dob';
import { onboardingTokens as t } from '../components/onboarding/tokens';
import { WheelPicker } from '../components/onboarding/WheelPicker';
import { footnote } from '../design-system';
import {
  getOnboardingProfile,
  updateOnboardingProfile,
} from '../lib/profileApi';

export default function EditDobScreen() {
  const router = useRouter();
  const [dobDay, setDobDay] = useState('1');
  const [dobMonth, setDobMonth] = useState('1');
  const [dobYear, setDobYear] = useState('1990');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOnboardingProfile().then((p) => {
      const m = p?.date_of_birth?.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (cancelled || !m) return;
      setDobYear(m[1]);
      setDobMonth(String(Number(m[2])));
      setDobDay(String(Number(m[3])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const yearNum = Number(dobYear);
  const monthNum = Number(dobMonth);
  // Clamp for month changes that shorten the month (e.g. 31 Jan -> Feb).
  const dayNum = Math.min(Number(dobDay), daysInMonth(monthNum, yearNum));
  const is18Plus = isAtLeast18(yearNum, monthNum, dayNum);

  const dayItems = useMemo(
    () =>
      Array.from({ length: daysInMonth(monthNum, yearNum) }, (_, i) => ({
        label: String(i + 1).padStart(2, '0'),
        value: String(i + 1),
      })),
    [monthNum, yearNum],
  );
  const monthItems = useMemo(
    () => MONTHS.map((m, i) => ({ label: m, value: String(i + 1) })),
    [],
  );
  const yearItems = useMemo(() => {
    const maxYear = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, i) => ({
      label: String(maxYear - i),
      value: String(maxYear - i),
    }));
  }, []);

  const handleSave = async () => {
    if (busy || !is18Plus) return;
    setBusy(true);
    setError(null);
    const { ok, error: err } = await updateOnboardingProfile({
      date_of_birth: toIsoDate(yearNum, monthNum, dayNum),
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
      title="What’s your DOB?"
      subtitle="Confirm you’re 18 or over"
      error={
        !is18Plus ? 'You must be 18 or over to use Annual Calendar.' : error
      }
      saveDisabled={!is18Plus}
      busy={busy}
      onSave={() => void handleSave()}
      footerNote={
        <View style={styles.privacyRow}>
          <Ionicons name="lock-closed" size={12} color={t.secondaryLabel} />
          <Text style={styles.privacyText}>Your age is always private</Text>
        </View>
      }
    >
      <WheelPicker
        columns={[
          {
            key: 'day',
            items: dayItems,
            selectedValue: String(dayNum),
            onValueChange: setDobDay,
            flex: 0.9,
          },
          {
            key: 'month',
            items: monthItems,
            selectedValue: dobMonth,
            onValueChange: setDobMonth,
            flex: 1.6,
          },
          {
            key: 'year',
            items: yearItems,
            selectedValue: dobYear,
            onValueChange: setDobYear,
            flex: 1.3,
          },
        ]}
      />
    </EditFieldScreen>
  );
}

const styles = StyleSheet.create({
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  privacyText: {
    ...footnote.regular,
    color: t.secondaryLabel,
  },
});
