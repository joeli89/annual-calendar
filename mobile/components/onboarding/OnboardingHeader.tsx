/**
 * Intent: Sheet header — back/close button top-left, AC monogram centred.
 * Why: Per Figma onboarding frames. Uses the shared AcLogo component, which
 * renders the real transparent logo asset (assets/ac-logo.png).
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AcLogo } from '../AcLogo';
import { onboardingTokens as t } from './tokens';

type Props = {
  /** 'close' on the first step, 'back' on subsequent steps. */
  buttonType: 'close' | 'back';
  onPress: () => void;
};

export function OnboardingHeader({ buttonType, onPress }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={buttonType === 'close' ? 'Close' : 'Back'}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
      >
        <Ionicons
          name={buttonType === 'close' ? 'close' : 'arrow-back'}
          size={20}
          color={t.label}
        />
      </Pressable>
      <AcLogo height={33} color={t.label} />
      {/* Spacer mirrors the nav button so the monogram stays centred */}
      <View style={styles.navButtonSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.secondaryFill,
  },
  navButtonSpacer: {
    width: 36,
    height: 36,
  },
  pressed: {
    opacity: 0.7,
  },
});
