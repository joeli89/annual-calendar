/**
 * Intent: Profile sheet per Figma 58:848 — profile card, collection summary,
 * and About section, presented as a modal over the current tab.
 * Why: One place for account access, collection recap, and app meta links.
 */
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GroupedCard, GroupedRow, SectionLabel } from '../components/GroupedList';
import { useOnboarding } from '../components/onboarding/OnboardingContext';
import {
  body,
  caption1,
  title3,
  useAppTheme,
  type AppTheme,
} from '../design-system';
import {
  fetchWatchBrands,
  getOnboardingProfile,
  type OnboardingProfile,
} from '../lib/profileApi';
import { useAuth } from '../lib/useAuth';

function initialsFor(name: string | null, email: string | null) {
  const source = name?.trim() || email?.trim() || '';
  return source ? source[0].toUpperCase() : '?';
}

export default function ProfileScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { user } = useAuth();
  const { openOnboarding } = useOnboarding();

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [brandNamesBySlug, setBrandNamesBySlug] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const [p, brands] = await Promise.all([
        getOnboardingProfile(),
        fetchWatchBrands(),
      ]);
      if (cancelled) return;
      setProfile(p);
      setBrandNamesBySlug(new Map(brands.map((b) => [b.slug, b.name])));
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const favouriteBrandsValue = useMemo(() => {
    const slugs = profile?.favorite_brands ?? [];
    if (slugs.length === 0) return '—';
    const first = brandNamesBySlug.get(slugs[0]) ?? slugs[0];
    return slugs.length > 1 ? `${first} +${slugs.length - 1}` : first;
  }, [profile, brandNamesBySlug]);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const displayName =
    profile?.display_name?.trim() || user?.email?.split('@')[0] || 'Profile';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.pressedDim,
          ]}
        >
          <Ionicons name="close" size={20} color={theme.labelColors.primary} />
        </Pressable>

        {user ? (
          <>
            <Pressable
              onPress={() => router.push('/account')}
              style={({ pressed }) => [
                styles.profileCard,
                pressed && styles.pressedDim,
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>
                  {initialsFor(profile?.display_name ?? null, user.email ?? null)}
                </Text>
              </View>
              <View style={styles.profileText}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {displayName}
                </Text>
                {user.email ? (
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                ) : null}
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.labelColors.tertiary}
              />
            </Pressable>

            <SectionLabel>Your collection</SectionLabel>
            <GroupedCard style={styles.sectionCard}>
              {/* Editing these reuses onboarding later; chevrons per design. */}
              <GroupedRow
                label="Collection size"
                value={profile?.collection_size ?? '—'}
              />
              <GroupedRow label="Favourite brands" value={favouriteBrandsValue} />
            </GroupedCard>
          </>
        ) : (
          <View style={styles.signedOutCard}>
            <Text style={styles.signedOutTitle}>You're not signed in</Text>
            <Text style={styles.signedOutSubtitle}>
              Sign in to save events and build your collection.
            </Text>
            <Pressable
              onPress={openOnboarding}
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.pressedDim,
              ]}
            >
              <Text style={styles.signInLabel}>Sign in</Text>
            </Pressable>
          </View>
        )}

        <SectionLabel>About</SectionLabel>
        <GroupedCard style={styles.sectionCard}>
          {/* Destinations for these three are not specced yet — rows render
              per design and will link out once product provides URLs. */}
          <GroupedRow label="Share feedback" icon="chatbubble-ellipses-outline" />
          <GroupedRow label="Terms of use" icon="document-text-outline" />
          <GroupedRow label="Privacy policy" icon="lock-closed-outline" />
          <GroupedRow
            label="Annual Calendar"
            icon="calendar-outline"
            value={appVersion}
            showChevron={false}
          />
        </GroupedCard>
      </ScrollView>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.palette.screen,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 48,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.palette.control,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    pressedDim: {
      opacity: 0.7,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.palette.card,
      borderRadius: 20,
      padding: 12,
      marginBottom: 24,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.palette.control,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      ...title3.emphasized,
      color: theme.labelColors.primary,
    },
    profileText: {
      flex: 1,
      gap: 2,
    },
    profileName: {
      ...title3.emphasized,
      color: theme.labelColors.primary,
    },
    profileEmail: {
      ...caption1.regular,
      color: theme.labelColors.secondary,
    },
    sectionCard: {
      marginBottom: 24,
    },
    signedOutCard: {
      backgroundColor: theme.palette.card,
      borderRadius: 20,
      padding: 20,
      gap: 8,
      marginBottom: 24,
    },
    signedOutTitle: {
      ...title3.emphasized,
      color: theme.labelColors.primary,
    },
    signedOutSubtitle: {
      ...body.regular,
      color: theme.labelColors.secondary,
    },
    signInButton: {
      marginTop: 8,
      alignSelf: 'flex-start',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 999,
      backgroundColor: theme.palette.primaryButtonBackground,
    },
    signInLabel: {
      ...body.emphasized,
      color: theme.palette.primaryButtonText,
    },
  });
}
