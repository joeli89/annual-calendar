import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { useAppTheme } from '../design-system';

export default function RootLayout() {
  const theme = useAppTheme();

  // Dark status bar content (time, icons) for contrast on light backgrounds; light content when theme is dark.
  const statusBarStyle = theme.isDark ? 'light' : 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style={statusBarStyle} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.palette.screen },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{ title: '', headerBackTitleVisible: false }}
          />
          <Stack.Screen
            name="events/[id]"
            options={{
              headerBackTitleVisible: false,
              headerBackButtonDisplayMode: 'minimal',
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
