/**
 * Intent: Magic-link sign-in screen; collects email and sends link via Supabase.
 * Why: Single place for unauthenticated users to sign in; entry from Profile and Saved.
 */
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack } from 'expo-router';

import { body, footnote, subheadline, useAppTheme, type AppTheme } from '../design-system';
import { getRedirectURL, sendMagicLink } from '../lib/auth';

export default function AuthScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const result = await sendMagicLink(email);
      if (result.ok) {
        setMessage({ type: 'success', text: 'Check your email for a sign-in link.' });
      } else {
        const text =
          result.error.toLowerCase().includes('rate limit')
            ? 'Too many sign-in attempts. Please wait a few minutes and try again.'
            : result.error;
        setMessage({ type: 'error', text });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sign in',
          headerShown: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.labelColors.primary,
        }}
      />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.content}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.labelColors.quaternary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              (loading || !email.trim()) && styles.buttonDisabled,
              pressed && !loading && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.palette.primaryButtonText} />
            ) : (
              <Text style={styles.buttonText}>Send magic link</Text>
            )}
          </Pressable>
          {message && (
            <Text
              style={[
                styles.message,
                message.type === 'error' ? styles.messageError : styles.messageSuccess,
              ]}
            >
              {message.text}
            </Text>
          )}
          <Text style={styles.hint}>
            We’ll send you a link to sign in. No password needed.
          </Text>
          {__DEV__ && (
            <View style={styles.devRedirectBlock}>
              <Text style={styles.devRedirectLabel}>
                Redirect URL used for the magic link (copy and add to Supabase → Authentication → URL Configuration → Redirect URLs if missing):
              </Text>
              <Text style={styles.devRedirectUrl} selectable>
                {getRedirectURL()}
              </Text>
              <Text style={styles.devRedirectNote}>
                {getRedirectURL().startsWith('mobile://')
                  ? 'Using app scheme. Keep this in Supabase so the email is sent. If the link opens Safari and shows "Unmatched Route", the app will still handle it via the auth-callback route.'
                  : 'Expo Go URL. Add this exact URL to Supabase so the link opens the app.'}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.palette.screen,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 32,
      gap: 16,
    },
    label: {
      ...subheadline.emphasized,
      color: theme.labelColors.primary,
    },
    input: {
      ...body.regular,
      color: theme.labelColors.primary,
      backgroundColor: theme.palette.card,
      borderWidth: 0.5,
      borderColor: theme.palette.cardBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    button: {
      height: 44,
      borderRadius: 999,
      backgroundColor: theme.palette.primaryButtonBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    buttonText: {
      ...subheadline.emphasized,
      color: theme.palette.primaryButtonText,
    },
    message: {
      ...footnote.regular,
      color: theme.labelColors.secondary,
    },
    messageError: {
      color: theme.labelColors.secondary,
    },
    messageSuccess: {
      color: theme.labelColors.primary,
    },
    hint: {
      ...footnote.regular,
      color: theme.labelColors.tertiary,
      marginTop: 8,
    },
    devRedirectBlock: {
      marginTop: 24,
      padding: 12,
      backgroundColor: theme.palette.control,
      borderRadius: 8,
      gap: 6,
    },
    devRedirectLabel: {
      ...footnote.regular,
      color: theme.labelColors.secondary,
    },
    devRedirectUrl: {
      ...footnote.regular,
      color: theme.labelColors.primary,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    devRedirectNote: {
      ...footnote.regular,
      color: theme.labelColors.tertiary,
      marginTop: 4,
      fontStyle: 'italic',
    },
  });
}
