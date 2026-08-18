/**
 * Intent: Black pill CTA (345x44) used as "Continue" throughout onboarding.
 * Why: Matches the event-detail primary button styling (Playfair label) but at
 * the onboarding sheet's fixed Figma metrics and light-only tokens.
 */
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { fontFamilies } from '../../design-system';
import { onboardingTokens as t } from './tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, disabled, loading }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={t.interactiveLabel} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: t.buttonWidth,
    maxWidth: '100%',
    height: t.buttonHeight,
    borderRadius: 999,
    backgroundColor: t.interactiveBackground,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  label: {
    fontFamily: fontFamilies.titleSemibold,
    fontSize: 15,
    color: t.interactiveLabel,
  },
});
