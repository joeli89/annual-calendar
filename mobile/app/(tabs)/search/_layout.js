/**
 * Intent: Nest a native Stack so the Search tab gets a native (iOS 26 liquid glass) header.
 * Why: Match the Events/Saved tab header behavior — without this Stack the screen has no
 * navigation bar and no top safe-area inset, so content collides with the status bar.
 */
import { Stack } from 'expo-router';

export default function SearchLayout() {
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
