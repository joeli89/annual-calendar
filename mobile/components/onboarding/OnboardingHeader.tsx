/**
 * Intent: Sheet header — back/close button top-left, AC monogram centred.
 * Why: Per Figma onboarding frames. The monogram is drawn in code because the
 * only logo asset (icon.png) has a baked-in beige background that would clash
 * with the white sheet; flagged as a design asset request.
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamilies } from '../../design-system';
import { onboardingTokens as t } from './tokens';

type Props = {
  /** 'close' on the first step, 'back' on subsequent steps. */
  buttonType: 'close' | 'back';
  onPress: () => void;
};

function AcMonogram() {
  return (
    <View style={styles.monogram}>
      <Text style={styles.monogramText}>AC</Text>
    </View>
  );
}

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
      <AcMonogram />
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
  monogram: {
    width: 28,
    height: 40,
    borderWidth: 1.5,
    borderColor: t.label,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontFamily: fontFamilies.titleBold,
    fontSize: 13,
    color: t.label,
  },
});
