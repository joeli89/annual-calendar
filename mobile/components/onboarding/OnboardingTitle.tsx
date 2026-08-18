/**
 * Intent: Step title (Playfair) + optional secondary subtitle, left-aligned.
 * Why: Shared across onboarding steps 2-6 per Figma frames.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { footnote, title2 } from '../../design-system';
import { onboardingTokens as t } from './tokens';

type Props = {
  title: string;
  subtitle?: string;
  /** Step 1 centres its title under the large monogram. */
  centered?: boolean;
};

export function OnboardingTitle({ title, subtitle, centered }: Props) {
  return (
    <View style={[styles.container, centered && styles.centered]}>
      <Text style={[styles.title, centered && styles.textCentered]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, centered && styles.textCentered]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    ...title2.emphasized,
    color: t.label,
  },
  subtitle: {
    ...footnote.regular,
    color: t.secondaryLabel,
  },
  textCentered: {
    textAlign: 'center',
  },
});
