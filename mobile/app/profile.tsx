import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Stack, useRouter } from 'expo-router';

import { largeTitle, subheadline, useAppTheme, type AppTheme } from '../design-system';
import { signOut } from '../lib/auth';
import { useAuth } from '../lib/useAuth';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/**
       * Intent: Make the profile screen slide up from the bottom instead of sliding from the side.
       * Why: Match the desired navigation feel when opening profile from Events.
       */}
      <Stack.Screen
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {user ? (
            <>
              <Text style={styles.subtitle}>You're signed in</Text>
              {user.email ? (
                <Text style={styles.emailLine}>{user.email}</Text>
              ) : null}
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [
                  styles.signOutButton,
                  pressed && styles.ctaButtonPressed,
                ]}
              >
                <Text style={styles.signOutLabel}>Sign out</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => router.push('/auth')}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
              ]}
            >
              <Text style={styles.ctaLabel}>Sign in with email</Text>
            </Pressable>
          )}
        </View>
      </View>
    </>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.palette.screen,
      paddingHorizontal: 20,
      paddingTop: 72,
    },
    header: {
      gap: 8,
    },
    title: {
      ...largeTitle.regular,
      color: theme.labelColors.primary,
    },
    subtitle: {
      ...subheadline.regular,
      color: theme.labelColors.secondary,
    },
    ctaButton: {
      marginTop: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 999,
      backgroundColor: theme.palette.primaryButtonBackground,
      alignSelf: 'flex-start',
    },
    ctaButtonPressed: {
      opacity: 0.8,
    },
    ctaLabel: {
      ...subheadline.emphasized,
      color: theme.palette.primaryButtonText,
    },
    emailLine: {
      ...subheadline.regular,
      color: theme.labelColors.secondary,
      marginTop: 4,
    },
    signOutButton: {
      marginTop: 16,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 999,
      backgroundColor: theme.palette.control,
      alignSelf: 'flex-start',
    },
    signOutLabel: {
      ...subheadline.regular,
      color: theme.labelColors.primary,
    },
  });
}

