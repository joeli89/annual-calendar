import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAppTheme } from '../design-system';

export default function RootLayout() {
  const theme = useAppTheme();

  // Dark status bar content (time, icons) for contrast on light backgrounds; light content when theme is dark.
  const statusBarStyle = theme.isDark ? 'light' : 'dark';

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.palette.screen },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="events/[id]" />
      </Stack>
    </>
  );
}
