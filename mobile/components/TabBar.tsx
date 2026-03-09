/**
 * Intent: Centralize native tab bar configuration for the app.
 * Why: Keep layout declarative and reuse tab structure in one place.
 */
import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

/**
 * Intent: Recover the runtime `Trigger.Label` component with a JSX-safe type.
 * Why: The current Expo Router typings omit this property, but it exists at runtime.
 */
const TriggerLabel = (
  NativeTabs.Trigger as unknown as {
    Label: React.ComponentType<{ children?: React.ReactNode }>;
  }
).Label;

export function TabBar() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="events">
        <TriggerLabel>Events</TriggerLabel>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <TriggerLabel>Saved</TriggerLabel>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <TriggerLabel>Search</TriggerLabel>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
