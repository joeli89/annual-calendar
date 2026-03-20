/**
 * Intent: Match the deep link path "auth-callback" so Expo Router doesn't show "Unmatched Route".
 * When the app opens via mobile://auth-callback#..., we land here, set the session, then redirect to tabs.
 */
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';

import { useAppTheme } from '../design-system';
import { isAuthCallbackUrl, setSessionFromAuthUrl } from '../lib/auth';

export default function AuthCallbackScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const completedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const tryUrl = async (url: string | null) => {
      if (cancelled || completedRef.current || !isAuthCallbackUrl(url)) return false;
      const ok = await setSessionFromAuthUrl(url!);
      if (cancelled || completedRef.current) return false;
      if (ok) {
        completedRef.current = true;
        setStatus('done');
        router.replace('/(tabs)');
        return true;
      }
      return false;
    };

    (async () => {
      const url = await Linking.getInitialURL();
      if (cancelled) return;
      if (await tryUrl(url)) return;
      // On iOS the URL is sometimes delivered via the 'url' event after a short delay
      const sub = Linking.addEventListener('url', ({ url: eventUrl }) => {
        tryUrl(eventUrl);
      });
      const timeout = setTimeout(() => {
        sub.remove();
        if (!cancelled && !completedRef.current) setStatus('error');
      }, 3000);
      return () => {
        clearTimeout(timeout);
        sub.remove();
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: theme.palette.screen }]}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color={theme.labelColors.primary} />
            <Text style={[styles.text, { color: theme.labelColors.secondary }]}>
              Signing you in…
            </Text>
          </>
        )}
        {status === 'error' && (
          <>
            <Text style={[styles.text, styles.errorLine, { color: theme.labelColors.secondary }]}>
              Could not complete sign-in.
            </Text>
            <Text style={[styles.text, styles.errorHint, { color: theme.labelColors.tertiary }]}>
              On iOS, open the magic link from the same device where you requested it. If it opened in Safari first, request a new link and tap it again.
            </Text>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontSize: 16,
  },
  errorLine: {
    textAlign: 'center',
  },
  errorHint: {
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
});
