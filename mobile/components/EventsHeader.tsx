/**
 * Intent: Encapsulate the Events screen native (liquid glass) header configuration.
 * Why: Keep header options and right-button UI in one reusable component.
 */
import React from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { Stack } from 'expo-router';

import { grays, headline } from '../design-system';

export function EventsHeader() {
  return (
    <Stack.Screen
      options={{
        title: 'Events',
        headerLargeTitle: false,
        headerRight: ({ tintColor }) => (
          <Pressable
            onPress={() => {}}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
            hitSlop={8}
          >
            <Text style={[styles.headerButtonIcon, { color: tintColor }]}>
              ≡
            </Text>
          </Pressable>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? {}
      : {
          backgroundColor: grays.white,
          shadowColor: grays.black,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3,
        }),
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerButtonIcon: {
    ...headline.regular,
  },
});
