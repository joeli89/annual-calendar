/**
 * Intent: Account screen per Figma (Profile section, second frame) — avatar,
 * personal details, sign out, and permanent account deletion.
 * Why: Give signed-in users one place to review their details and leave.
 */
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GroupedCard, GroupedRow } from '../components/GroupedList';
import {
  fontFamilies,
  title3,
  useAppTheme,
  type AppTheme,
} from '../design-system';
import { deleteAccount, signOut } from '../lib/auth';
import {
  getOnboardingProfile,
  type OnboardingProfile,
} from '../lib/profileApi';
import { useAuth } from '../lib/useAuth';

// '1989-01-21' -> '21/01/1989' per the design.
function formatDob(iso: string | null) {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export default function AccountScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [busy, setBusy] = useState(false);

  // Refetch on focus so values edited on the stacked screens show up on return.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getOnboardingProfile().then((p) => {
        if (!cancelled) setProfile(p);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const initial =
    (profile?.display_name?.trim() || user?.email || '?')[0].toUpperCase();

  const closeAllModals = () => {
    router.dismissAll();
  };

  const handleSignOut = async () => {
    if (busy) return;
    setBusy(true);
    await signOut();
    setBusy(false);
    closeAllModals();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete my account',
      'This permanently deletes your account, saved events, and collection details. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (busy) return;
            setBusy(true);
            const { error } = await deleteAccount();
            setBusy(false);
            if (error) {
              Alert.alert('Could not delete account', error);
              return;
            }
            closeAllModals();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.navRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedDim,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={theme.labelColors.primary}
            />
          </Pressable>
          <Text style={styles.navTitle}>Account</Text>
          <View style={styles.navSpacer} />
        </View>

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          {/* Edit badge per design; photo editing isn't wired up yet. */}
          <View style={styles.avatarBadge}>
            <Ionicons
              name="pencil"
              size={12}
              color={theme.palette.primaryButtonText}
            />
          </View>
        </View>

        <GroupedCard style={styles.detailsCard}>
          <GroupedRow
            label="Name"
            value={profile?.display_name ?? '—'}
            onPress={() => router.push('/edit-name')}
          />
          <GroupedRow
            label="Date of birth"
            value={formatDob(profile?.date_of_birth ?? null) ?? '—'}
            onPress={() => router.push('/edit-dob')}
          />
          <GroupedRow
            label="Location"
            value={profile?.location ?? '—'}
            onPress={() => router.push('/edit-location')}
          />
        </GroupedCard>

        <View style={styles.actions}>
          <Pressable
            onPress={handleSignOut}
            disabled={busy}
            style={({ pressed }) => [
              styles.actionButton,
              styles.signOutButton,
              pressed && styles.pressedDim,
            ]}
          >
            <Text style={styles.signOutLabel}>Sign out</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            disabled={busy}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.pressedDim,
            ]}
          >
            <Text style={styles.deleteLabel}>Delete my account</Text>
          </Pressable>
        </View>
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
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.palette.control,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navTitle: {
      ...title3.emphasized,
      color: theme.labelColors.primary,
      flex: 1,
      textAlign: 'center',
    },
    navSpacer: {
      width: 36,
    },
    pressedDim: {
      opacity: 0.7,
    },
    avatarWrap: {
      alignSelf: 'center',
      marginBottom: 32,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.palette.control,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      fontFamily: fontFamilies.titleSemibold,
      fontSize: 40,
      color: theme.labelColors.primary,
    },
    avatarBadge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.palette.primaryButtonBackground,
      borderWidth: 2,
      borderColor: theme.palette.screen,
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailsCard: {
      marginBottom: 24,
    },
    actions: {
      marginTop: 'auto',
      gap: 12,
    },
    actionButton: {
      height: 48,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signOutButton: {
      backgroundColor: theme.palette.control,
    },
    signOutLabel: {
      fontFamily: fontFamilies.titleSemibold,
      fontSize: 16,
      color: theme.labelColors.primary,
    },
    deleteButton: {
      backgroundColor: 'rgba(255, 66, 69, 0.12)',
    },
    deleteLabel: {
      fontFamily: fontFamilies.titleSemibold,
      fontSize: 16,
      color: theme.isDark ? '#ff6b6e' : '#c0272b',
    },
  });
}
