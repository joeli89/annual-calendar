import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { OnboardingProvider } from '../components/onboarding/OnboardingContext';
import { useAppTheme } from '../design-system';
import { isAuthCallbackUrl, setSessionFromAuthUrl } from '../lib/auth';
import { SaveIntentProvider } from '../lib/saveIntent';
import { AuthProvider } from '../lib/useAuth';

function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (url) => {
      if (!isAuthCallbackUrl(url)) return;
      const ok = await setSessionFromAuthUrl(url);
      if (ok) router.replace('/(tabs)');
    };

    // Cold start: app opened by the link
    Linking.getInitialURL().then(handleUrl);
    // App already open: user returns from browser, OS opens app with the link
    const linkSub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    // Return from background: URL may have been delivered while app was inactive
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') Linking.getInitialURL().then(handleUrl);
    });
    return () => {
      linkSub.remove();
      appStateSub.remove();
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  const theme = useAppTheme();

  // Load Playfair Display (used by the Title text styles). Wait for the fonts
  // before first paint so headings don't flash in the system font; still render
  // if the load errors so the app never gets stuck on a blank screen.
  const [fontsLoaded, fontError] = useFonts({
    'PlayfairDisplay-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-SemiBold': require('../assets/fonts/PlayfairDisplay-SemiBold.ttf'),
    'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
  });

  if (!fontsLoaded && !fontError) return null;

  // Dark status bar content (time, icons) for contrast on light backgrounds; light content when theme is dark.
  const statusBarStyle = theme.isDark ? 'light' : 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
      <SaveIntentProvider>
      <DeepLinkHandler />
      <BottomSheetModalProvider>
        <OnboardingProvider>
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
          {/* Card sheets per Figma: dimmed underlying screen + grabber. */}
          <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="account" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="auth"
            options={{
              title: 'Sign in',
              headerShown: true,
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="auth-callback"
            options={{ headerShown: false, gestureEnabled: false }}
          />
        </Stack>
        </OnboardingProvider>
      </BottomSheetModalProvider>
      </SaveIntentProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
