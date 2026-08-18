/**
 * Intent: "Continue with Apple / Google" buttons for onboarding step 1.
 * Why: Same metrics as PrimaryButton (345x44) with a leading provider mark,
 * per Figma node 87:3556.
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { subheadline } from '../../design-system';
import { onboardingTokens as t } from './tokens';

type Props = {
  provider: 'apple' | 'google';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function SocialAuthButton({ provider, onPress, disabled, loading }: Props) {
  const label =
    provider === 'apple' ? 'Continue with Apple' : 'Continue with Google';
  const icon = provider === 'apple' ? 'logo-apple' : 'logo-google';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
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
        <View style={styles.row}>
          <Ionicons name={icon} size={18} color={t.interactiveLabel} />
          <Text style={styles.label}>{label}</Text>
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...subheadline.emphasized,
    color: t.interactiveLabel,
  },
});
