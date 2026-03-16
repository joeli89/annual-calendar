import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Stack } from 'expo-router';

import { largeTitle, subheadline, useAppTheme, type AppTheme } from '../design-system';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      {/**
       * Intent: Make the profile screen slide up from the bottom instead of sliding from the side.
       * Why: Match the desired navigation feel when opening profile from Events.
       */}
      <Stack.Screen
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Coming soon</Text>
        </View>
      </View>
    </>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.palette.screen,
      paddingHorizontal: 20,
      paddingTop: 72,
    },
    header: {
      gap: 8,
    },
    title: {
      ...largeTitle.regular,
      color: theme.labelColors.primary,
    },
    subtitle: {
      ...subheadline.regular,
      color: theme.labelColors.secondary,
    },
  });
}

