/**
 * Intent: Nest a native Stack so the Saved tab gets a native (iOS 26 liquid glass) header.
 * Why: Match the Events tab header behavior for push navigation from Saved.
 */
import { Stack } from 'expo-router';

export default function SavedLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerStyle: { backgroundColor: 'transparent' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '',
          headerTitle: () => null,
        }}
      />
    </Stack>
  );
}

