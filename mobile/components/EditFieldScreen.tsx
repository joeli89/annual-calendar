/**
 * Intent: Shared scaffold for the profile/account edit screens — the
 * onboarding sheet chrome (back button + centred monogram header, Playfair
 * title, 24pt gutters) with a pinned Save CTA above the home indicator.
 * Why: Five screens (name, DOB, location, collection size, brands) reuse the
 * onboarding step layout (Figma 72:1655); one scaffold keeps them identical.
 */
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { footnote } from '../design-system';
import { OnboardingHeader } from './onboarding/OnboardingHeader';
import { OnboardingTitle } from './onboarding/OnboardingTitle';
import { PrimaryButton } from './onboarding/PrimaryButton';
import { onboardingTokens as t } from './onboarding/tokens';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Extra content above the error/CTA (e.g. the DOB privacy row). */
  footerNote?: React.ReactNode;
  error?: string | null;
  saveDisabled?: boolean;
  busy?: boolean;
  onSave: () => void;
};

export function EditFieldScreen({
  title,
  subtitle,
  children,
  footerNote,
  error,
  saveDisabled,
  busy,
  onSave,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(), []);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingHeader buttonType="back" onPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <OnboardingTitle title={title} subtitle={subtitle} />
        {children}
      </ScrollView>
      {/* Clear the home indicator; matches the onboarding CTA position. */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        {footerNote}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <PrimaryButton
          label="Save"
          disabled={saveDisabled}
          loading={busy}
          onPress={onSave}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles() {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.background,
      paddingTop: 8,
    },
    body: {
      gap: 24,
      paddingTop: 24,
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    footer: {
      gap: 12,
      paddingTop: 12,
      paddingHorizontal: 24,
    },
    errorText: {
      ...footnote.regular,
      color: '#c0272b',
      textAlign: 'center',
    },
  });
}
