/**
 * Intent: Events filter sheet — native iOS formSheet with two simple controls:
 * access (All/Free/Paid segmented control) and country chips.
 * Why: Kept deliberately small; filters apply live via the shared context.
 */
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  fontFamilies,
  footnote,
  largeTitle,
  subheadline,
  useAppTheme,
  type AppTheme,
} from '../design-system';
import { useEventFilters, type AccessFilter } from '../lib/eventFilters';

const ACCESS_SEGMENTS: { label: string; value: AccessFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
];

export default function EventFiltersScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    accessFilter,
    countryFilter,
    countryOptions,
    hasActiveFilters,
    setAccessFilter,
    setCountryFilter,
    clearFilters,
  } = useEventFilters();

  return (
    <View
      style={[
        styles.screen,
        styles.content,
        { paddingBottom: Math.max(insets.bottom, 16) + 8 },
      ]}
    >
        <Text style={styles.title}>Filters</Text>

        <Text style={styles.sectionLabel}>Access</Text>
        <SegmentedControl
          values={ACCESS_SEGMENTS.map((s) => s.label)}
          selectedIndex={ACCESS_SEGMENTS.findIndex((s) => s.value === accessFilter)}
          onChange={(event) =>
            setAccessFilter(
              ACCESS_SEGMENTS[event.nativeEvent.selectedSegmentIndex].value,
            )
          }
          appearance={theme.isDark ? 'dark' : 'light'}
        />

        <Text style={styles.sectionLabel}>Country</Text>
        <View style={styles.chips}>
          {countryOptions.map((country) => {
            const selected = countryFilter === country;
            return (
              <Pressable
                key={country}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setCountryFilter(selected ? null : country)}
                style={({ pressed }) => [
                  styles.chip,
                  selected && styles.chipSelected,
                  pressed && styles.chipPressed,
                ]}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {country}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.doneButton,
            pressed && styles.doneButtonPressed,
          ]}
        >
          <Text style={styles.doneLabel}>Done</Text>
        </Pressable>
        <Pressable
          onPress={clearFilters}
          disabled={!hasActiveFilters}
          style={({ pressed }) => [
            styles.clearButton,
            !hasActiveFilters && styles.clearButtonDisabled,
            pressed && styles.clearButtonPressed,
          ]}
        >
          <Text style={styles.clearButtonLabel}>Clear filters</Text>
        </Pressable>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      backgroundColor: theme.palette.screen,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 24,
      gap: 8,
    },
    title: {
      ...largeTitle.regular,
      color: theme.labelColors.primary,
    },
    clearButton: {
      marginTop: 4,
      height: 44,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.control,
    },
    clearButtonDisabled: {
      opacity: 0.4,
    },
    clearButtonPressed: {
      opacity: 0.7,
    },
    clearButtonLabel: {
      fontFamily: fontFamilies.titleSemibold,
      fontSize: 15,
      color: theme.labelColors.primary,
    },
    sectionLabel: {
      ...footnote.regular,
      color: theme.labelColors.secondary,
      marginTop: 16,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 4,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.palette.control,
    },
    chipSelected: {
      backgroundColor: theme.palette.primaryButtonBackground,
    },
    chipPressed: {
      opacity: 0.7,
    },
    chipLabel: {
      ...subheadline.regular,
      color: theme.labelColors.primary,
    },
    chipLabelSelected: {
      color: theme.palette.primaryButtonText,
    },
    doneButton: {
      marginTop: 24,
      height: 48,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.primaryButtonBackground,
    },
    doneButtonPressed: {
      opacity: 0.8,
    },
    doneLabel: {
      fontFamily: fontFamilies.titleSemibold,
      fontSize: 16,
      color: theme.palette.primaryButtonText,
    },
  });
}
