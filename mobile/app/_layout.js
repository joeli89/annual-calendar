import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAppTheme } from '../design-system';

export default function RootLayout() {
  const theme = useAppTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.palette.screen },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="events/[id]" />
      </Stack>
      <StatusBar style={theme.statusBarStyle} />
    </>
  );
}
