/**
 * Intent: Handle the magic-link deep link (mobile://auth-callback?code=...) without
 * ever trapping the user. Auth is OPTIONAL in this app, so this screen always lands
 * the user in the app (/events) — signed in if the link completed, just browsing if
 * not. Sign-in happens in the background; the session propagates via AuthProvider.
 */
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';

import { useAppTheme } from '../design-system';
import { isAuthCallbackUrl, setSessionFromAuthUrl } from '../lib/auth';

export default function AuthCallbackScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let sub: { remove: () => void } | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Always end up in the app. Never leave the user stuck on this screen.
    const goToApp = () => {
      if (cancelled || doneRef.current) return;
      doneRef.current = true;
      router.replace('/events');
    };

    const handle = async (url: string | null) => {
      if (isAuthCallbackUrl(url)) {
        // Best-effort: sets the session on success; ignored on failure.
        await setSessionFromAuthUrl(url!);
      }
      goToApp();
    };

    (async () => {
      const initial = await Linking.getInitialURL();
      if (cancelled) return;
      if (isAuthCallbackUrl(initial)) {
        await setSessionFromAuthUrl(initial!);
        goToApp();
        return;
      }
      // The URL can arrive via the 'url' event a moment after launch on iOS.
      sub = Linking.addEventListener('url', ({ url }) => handle(url));
      // Safety net: continue into the app regardless after a short wait.
      timer = setTimeout(goToApp, 2500);
    })();

    return () => {
      cancelled = true;
      if (sub) sub.remove();
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: theme.palette.screen }]}>
        <ActivityIndicator size="large" color={theme.labelColors.primary} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
