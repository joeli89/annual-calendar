/**
 * Intent: The save-triggered onboarding flow content — auth step + 5 profile
 * steps — rendered inside a bottom-sheet modal (Figma section 72:1655).
 * Why: Signing in must never navigate away from the event the user tried to
 * save. Each Continue persists one small UPDATE so partial progress resumes;
 * the save intent itself is flushed by SaveIntentProvider the moment a session
 * exists, so dismissing at any point after auth still saves the event.
 */
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { footnote } from '../../design-system';
import { AcLogo } from '../AcLogo';
import { track } from '../../lib/analytics';
import {
  completeOnboarding,
  COLLECTION_SIZES,
  fetchWatchBrands,
  getOnboardingProfile,
  updateOnboardingProfile,
  type OnboardingProfile,
  type WatchBrand,
} from '../../lib/profileApi';
import { signInWithApple, signInWithGoogle } from '../../lib/socialAuth';
import { useAuth } from '../../lib/useAuth';
import { InputField } from './InputField';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingTitle } from './OnboardingTitle';
import { PillTagList } from './PillTagList';
import { PrimaryButton } from './PrimaryButton';
import { SocialAuthButton } from './SocialAuthButton';
import { onboardingTokens as t } from './tokens';
import { WheelPicker } from './WheelPicker';

export type OnboardingStep =
  | 'auth'
  | 'name'
  | 'dob'
  | 'location'
  | 'collection'
  | 'brands';

const PROFILE_STEPS: OnboardingStep[] = [
  'name',
  'dob',
  'location',
  'collection',
  'brands',
];

const NAME_MAX = 50;
const LOCATION_MAX = 100;
const BRANDS_MAX = 6;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function isAtLeast18(year: number, month: number, day: number): boolean {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return new Date(year, month - 1, day) <= cutoff;
}

function toIsoDate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/** First profile step the user has not answered yet. Null = all answered. */
function firstUnansweredStep(profile: OnboardingProfile): OnboardingStep | null {
  if (!profile.display_name?.trim()) return 'name';
  if (!profile.date_of_birth) return 'dob';
  if (!profile.location?.trim()) return 'location';
  if (!profile.collection_size) return 'collection';
  if (profile.favorite_brands.length === 0) return 'brands';
  return null;
}

type Props = {
  dismiss: () => void;
  /** Mutated so the host can log onboarding_abandoned on early dismissal. */
  sessionRef: React.MutableRefObject<{ step: OnboardingStep; completed: boolean }>;
};

export function OnboardingSheet({ dismiss, sessionRef }: Props) {
  const { user, refresh } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('auth');
  const [history, setHistory] = useState<OnboardingStep[]>([]);
  const [busy, setBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(Date.now());

  // Step answers
  const [name, setName] = useState('');
  const now = useMemo(() => new Date(), []);
  const [dobDay, setDobDay] = useState('1');
  const [dobMonth, setDobMonth] = useState('1');
  const [dobYear, setDobYear] = useState('1990');
  const [location, setLocation] = useState('');
  const [collectionSize, setCollectionSize] = useState('1-3');
  const [brands, setBrands] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<WatchBrand[]>([]);

  useEffect(() => {
    sessionRef.current.step = step;
    track('onboarding_viewed', { step });
    setError(null);
  }, [step, sessionRef]);

  // Brands are public-read; prefetch so step 6 renders instantly.
  useEffect(() => {
    let cancelled = false;
    fetchWatchBrands().then((rows) => {
      if (!cancelled) setBrandOptions(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyProfileToState = useCallback((profile: OnboardingProfile) => {
    if (profile.display_name) setName(profile.display_name);
    if (profile.date_of_birth) {
      const [y, m, d] = profile.date_of_birth.split('-').map(Number);
      if (y && m && d) {
        setDobYear(String(y));
        setDobMonth(String(m));
        setDobDay(String(d));
      }
    }
    if (profile.location) setLocation(profile.location);
    if (profile.collection_size) setCollectionSize(profile.collection_size);
    if (profile.favorite_brands.length > 0) setBrands(profile.favorite_brands);
  }, []);

  const goTo = useCallback(
    (next: OnboardingStep) => {
      setHistory((h) => [...h, step]);
      setStep(next);
    },
    [step]
  );

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      // Never navigate back into the auth step once signed in.
      if (prev === 'auth' && user) return h.slice(0, -1);
      setStep(prev);
      return h.slice(0, -1);
    });
  }, [user]);

  const finish = useCallback(async () => {
    setBusy(true);
    const result = await completeOnboarding();
    setBusy(false);
    if (!result.ok) {
      setError('Could not finish setup. Please try again.');
      return;
    }
    track('onboarding_completed', { duration_ms: Date.now() - startedAt.current });
    sessionRef.current.completed = true;
    dismiss();
  }, [dismiss, sessionRef]);

  /** Resume an authed user at the right step, or finish for onboarded users. */
  const routeAfterAuth = useCallback(
    async (prefillName: string | null) => {
      const profile = await getOnboardingProfile();
      if (profile?.onboarding_completed_at) {
        // Returning onboarded user: one tap total — the pending save is
        // flushed by SaveIntentProvider; just get out of the way.
        sessionRef.current.completed = true;
        dismiss();
        return;
      }
      if (profile) applyProfileToState(profile);
      if (prefillName && !profile?.display_name) setName(prefillName);
      const next = profile ? firstUnansweredStep(profile) : 'name';
      if (next) {
        goTo(next);
      } else {
        // Everything answered but never stamped complete — stamp and close.
        await finish();
      }
    },
    [applyProfileToState, dismiss, finish, goTo, sessionRef]
  );

  // If the sheet was opened while already signed in (e.g. resuming a partial
  // profile from Saved/Profile), skip the auth step immediately.
  const routedOnOpen = useRef(false);
  useEffect(() => {
    if (routedOnOpen.current) return;
    routedOnOpen.current = true;
    if (user) {
      void routeAfterAuth(null);
    }
  }, [user, routeAfterAuth]);

  const handleAuth = useCallback(
    async (provider: 'apple' | 'google') => {
      setError(null);
      setAuthBusy(provider);
      track('auth_attempted', { provider });
      try {
        const result =
          provider === 'apple'
            ? await signInWithApple()
            : await signInWithGoogle();
        if (result.ok === false) {
          track('auth_failed', { provider, error_code: result.code });
          // Cancelling is not an error state; stay quietly on step 1 with the
          // save intent intact so the user can retry or dismiss.
          if (result.code !== 'cancelled') {
            setError(
              result.code === 'unavailable'
                ? result.error
                : 'Sign-in didn’t work. Please try again.'
            );
          }
          return;
        }
        track('auth_succeeded', { provider });
        await refresh();
        await routeAfterAuth(result.fullName);
      } finally {
        setAuthBusy(null);
      }
    },
    [refresh, routeAfterAuth]
  );

  const persistStep = useCallback(
    async (
      patch: Parameters<typeof updateOnboardingProfile>[0],
      currentStep: OnboardingStep,
      next: OnboardingStep | 'done'
    ) => {
      setBusy(true);
      const result = await updateOnboardingProfile(patch);
      setBusy(false);
      if (!result.ok) {
        setError('Couldn’t save that. Check your connection and try again.');
        return;
      }
      track('onboarding_step_completed', { step: currentStep });
      if (next === 'done') {
        await finish();
      } else {
        goTo(next);
      }
    },
    [finish, goTo]
  );

  const skipStep = useCallback(
    (currentStep: OnboardingStep, next: OnboardingStep | 'done') => {
      if (next === 'done') {
        void finish();
      } else {
        goTo(next);
      }
    },
    [finish, goTo]
  );

  // ---------- validation ----------
  const nameValid = name.trim().length > 0 && name.trim().length <= NAME_MAX;
  const dobYearNum = Number(dobYear);
  const dobMonthNum = Number(dobMonth);
  const dobDayNum = Math.min(
    Number(dobDay),
    daysInMonth(dobMonthNum, dobYearNum)
  );
  const dobIs18Plus = isAtLeast18(dobYearNum, dobMonthNum, dobDayNum);
  const locationValid =
    location.trim().length > 0 && location.trim().length <= LOCATION_MAX;
  const brandsValid = brands.length >= 1 && brands.length <= BRANDS_MAX;

  const dayItems = useMemo(
    () =>
      Array.from({ length: daysInMonth(dobMonthNum, dobYearNum) }, (_, i) => ({
        label: String(i + 1).padStart(2, '0'),
        value: String(i + 1),
      })),
    [dobMonthNum, dobYearNum]
  );
  const monthItems = useMemo(
    () => MONTHS.map((m, i) => ({ label: m, value: String(i + 1) })),
    []
  );
  const yearItems = useMemo(() => {
    const maxYear = now.getFullYear();
    return Array.from({ length: 101 }, (_, i) => ({
      label: String(maxYear - i),
      value: String(maxYear - i),
    }));
  }, [now]);

  const toggleBrand = useCallback((slug: string) => {
    setBrands((prev) =>
      prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug]
    );
  }, []);

  // ---------- render ----------
  const showBack = history.length > 0 && !(history.length === 1 && history[0] === 'auth' && !!user);
  const headerType: 'close' | 'back' = step === 'auth' || !showBack ? 'close' : 'back';

  const renderSkip = (currentStep: OnboardingStep, next: OnboardingStep | 'done') => (
    <Pressable
      accessibilityRole="button"
      onPress={() => skipStep(currentStep, next)}
      style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
    >
      <Text style={styles.skipLabel}>Skip for now</Text>
    </Pressable>
  );

  const errorBanner = error ? <Text style={styles.error}>{error}</Text> : null;

  let content: React.ReactNode = null;
  switch (step) {
    case 'auth':
      content = (
        <View style={styles.authLayout}>
          <View style={styles.authHero}>
            <AcLogo height={73} color={t.label} />
            <OnboardingTitle
              centered
              title="Join Annual Calendar"
              subtitle="Save the events you don’t want to miss."
            />
          </View>
          <View style={styles.authButtons}>
            {errorBanner}
            <SocialAuthButton
              provider="apple"
              loading={authBusy === 'apple'}
              disabled={authBusy !== null}
              onPress={() => void handleAuth('apple')}
            />
            <SocialAuthButton
              provider="google"
              loading={authBusy === 'google'}
              disabled={authBusy !== null}
              onPress={() => void handleAuth('google')}
            />
          </View>
        </View>
      );
      break;
    case 'name':
      content = (
        <View style={styles.stepLayout}>
          <View style={styles.stepBody}>
            <OnboardingTitle
              title="What’s your name?"
              subtitle="Allows us to get to know you"
            />
            <InputField
              value={name}
              onChangeText={setName}
              placeholder="What should we call you?"
              maxLength={NAME_MAX}
              autoFocus
            />
          
          </View>
          <View style={styles.stepFooter}>
  {errorBanner}
            <PrimaryButton
              label="Continue"
              disabled={!nameValid}
              loading={busy}
              onPress={() =>
                void persistStep({ display_name: name.trim() }, 'name', 'dob')
              }
            />
          </View>
        </View>
      );
      break;
    case 'dob':
      content = (
        <View style={styles.stepLayout}>
          <View style={styles.stepBody}>
            <OnboardingTitle
            title="What’s your DOB?"
            subtitle="Confirm you’re 18 or over"
          />
          <WheelPicker
            columns={[
              {
                key: 'day',
                items: dayItems,
                selectedValue: String(dobDayNum),
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
                // Wider than day: a 4-digit year was being truncated to "19…".
                flex: 1.3,
              },
            ]}
          />
          </View>
          <View style={styles.stepFooter}>
            <View style={styles.privacyRow}>
              <Ionicons name="lock-closed" size={12} color={t.secondaryLabel} />
              <Text style={styles.privacyText}>Your age is always private</Text>
            </View>
            {!dobIs18Plus ? (
            <Text style={styles.error}>
              You must be 18 or over to use Annual Calendar.
            </Text>
          ) : (
            errorBanner
          )}
          <PrimaryButton
            label="Continue"
            disabled={!dobIs18Plus}
            loading={busy}
            onPress={() =>
              void persistStep(
                { date_of_birth: toIsoDate(dobYearNum, dobMonthNum, dobDayNum) },
                'dob',
                'location'
              )
            }
          />
            {renderSkip('dob', 'location')}
          </View>
        </View>
      );
      break;
    case 'location':
      content = (
        <View style={styles.stepLayout}>
          <View style={styles.stepBody}>
            <OnboardingTitle
              title="Where are you from?"
              subtitle="Where do you live most of the time."
            />
            <InputField
              value={location}
              onChangeText={setLocation}
              placeholder="Where do you live most of the time?"
              maxLength={LOCATION_MAX}
            />
          
          </View>
          <View style={styles.stepFooter}>
  {errorBanner}
            <PrimaryButton
              label="Continue"
              disabled={!locationValid}
              loading={busy}
              onPress={() =>
                void persistStep(
                  { location: location.trim() },
                  'location',
                  'collection'
                )
              }
            />
            {renderSkip('location', 'collection')}
          </View>
        </View>
      );
      break;
    case 'collection':
      content = (
        <View style={styles.stepLayout}>
          <View style={styles.stepBody}>
            <OnboardingTitle
              title="How many watches do you have in your collection?"
              // Figma subtitle here is a copy-paste error ("Where do you live most
              // of the time.") — omitted pending copy from Design.
            />
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
          
          </View>
          <View style={styles.stepFooter}>
  {errorBanner}
            <PrimaryButton
              label="Continue"
              loading={busy}
              onPress={() =>
                void persistStep(
                  { collection_size: collectionSize },
                  'collection',
                  'brands'
                )
              }
            />
            {renderSkip('collection', 'brands')}
          </View>
        </View>
      );
      break;
    case 'brands':
      content = (
        <View style={styles.stepLayout}>
          <View style={styles.stepBody}>
            <OnboardingTitle
              title="What are your favourite brands?"
              subtitle="Select a minimum of 1"
            />
            <PillTagList
              options={brandOptions.map((b) => ({ value: b.slug, label: b.name }))}
              selected={brands}
              onToggle={toggleBrand}
              maxSelected={BRANDS_MAX}
            />
          
          </View>
          <View style={styles.stepFooter}>
  {errorBanner}
            <PrimaryButton
              label="Continue"
              disabled={!brandsValid}
              loading={busy}
              onPress={() =>
                void persistStep({ favorite_brands: brands }, 'brands', 'done')
              }
            />
            {renderSkip('brands', 'done')}
          </View>
        </View>
      );
      break;
  }

  return (
    <View style={styles.container}>
      <OnboardingHeader
        buttonType={headerType}
        onPress={headerType === 'back' ? goBack : dismiss}
      />
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  authLayout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 8,
  },
  authHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  authButtons: {
    gap: 12,
    paddingBottom: 16,
  },
  /**
   * Shared shell for EVERY step: content sits at the top, the CTA block is
   * pinned to the bottom, with the space between them. Steps must not add
   * their own layout nuance — keep them identical.
   */
  stepLayout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 8,
  },
  stepBody: {
    gap: 24,
  },
  stepFooter: {
    gap: 12,
  },
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
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipLabel: {
    ...footnote.regular,
    color: t.secondaryLabel,
  },
  pressed: {
    opacity: 0.7,
  },
  error: {
    ...footnote.regular,
    color: t.label,
    textAlign: 'center',
  },
});
