/**
 * Intent: Multi-select brand pills for onboarding step 6 (Figma 79:3331).
 * Why: Selected pills invert to the interactive colours; selection is capped
 * by maxSelected (further taps on unselected pills are ignored at the cap).
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { subheadline } from '../../design-system';
import { onboardingTokens as t } from './tokens';

type Props = {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  maxSelected?: number;
};

export function PillTagList({ options, selected, onToggle, maxSelected }: Props) {
  const atCap = maxSelected != null && selected.length >= maxSelected;
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const capBlocked = atCap && !isSelected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              if (!capBlocked) onToggle(option.value);
            }}
            style={({ pressed }) => [
              styles.pill,
              isSelected && styles.pillSelected,
              capBlocked && styles.pillDimmed,
              pressed && !capBlocked && styles.pillPressed,
            ]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: t.secondaryFill,
  },
  pillSelected: {
    backgroundColor: t.interactiveBackground,
  },
  pillDimmed: {
    opacity: 0.35,
  },
  pillPressed: {
    opacity: 0.7,
  },
  label: {
    ...subheadline.regular,
    color: t.label,
  },
  labelSelected: {
    color: t.interactiveLabel,
  },
});
