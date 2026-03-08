/**
 * Intent: Centralize native tab bar configuration for the app.
 * Why: Keep layout declarative and reuse tab structure in one place.
 */
import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

// Trigger.Label exists at runtime; expo-router types omit it in this SDK version.
const TriggerLabel = (NativeTabs.Trigger as unknown as { Label: (props: { children?: unknown }) => unknown }).Label;

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
