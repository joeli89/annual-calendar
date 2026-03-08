/**
 * Intent: Nest a native Stack so the events tab gets a native (iOS 26 liquid glass) header.
 * Why: Native tabs don't provide a header; nesting Stack enables headers and push navigation.
 */
import { Stack } from 'expo-router';

const SCREEN_BG = '#f6f6f6';

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: SCREEN_BG },
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
