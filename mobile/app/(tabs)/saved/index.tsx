/**
 * Intent: Render the Saved events grid screen using the Saved card design from Figma.
 * Why: Give users a dedicated place to browse events they have favorited (Supabase-backed).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';

import { SavedEventCard } from '../../../components/SavedEventCard';
import { useAppTheme, type AppTheme, body } from '../../../design-system';
import type { Event } from '../../../types/event';
import { fetchEvents, getFavoriteEventIds } from '../../../lib/eventsApi';
import { useAuth } from '../../../lib/useAuth';
import { isSupabaseConfigured } from '../../../lib/supabase';

export default function SavedScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segmentIndex, setSegmentIndex] = useState(0);

  const loadSavedEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allEvents = await fetchEvents();
      let savedEvents: Event[] = [];

      if (isSupabaseConfigured() && user) {
        const favoriteIds = await getFavoriteEventIds();
        savedEvents = allEvents.filter((e) => favoriteIds.has(e.id));
      }

      setEvents(savedEvents);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load saved events');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const allEvents = await fetchEvents();
      let savedEvents: Event[] = [];

      if (isSupabaseConfigured() && user) {
        const favoriteIds = await getFavoriteEventIds();
        savedEvents = allEvents.filter((e) => favoriteIds.has(e.id));
      }

      setEvents(savedEvents);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh saved events');
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadSavedEvents();
  }, [loadSavedEvents]);

  // Intent: Re-fetch saved events whenever the Saved tab gains focus so
  // that newly favorited events appear without requiring a manual refresh.
  useFocusEffect(
    useCallback(() => {
      loadSavedEvents();
    }, [loadSavedEvents]),
  );

  const handlePressCard = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const today = useMemo(() => new Date(), []);

  const visibleEvents = useMemo(() => {
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const getEventMonthStart = (event: Event) =>
      new Date(event.year, event.month - 1, 1);

    if (segmentIndex === 0) {
      // Coming Up: event start >= start of current month
      return events.filter((event) => getEventMonthStart(event) >= todayMonthStart);
    }
    // Previous: event start before current month
    return events.filter((event) => getEventMonthStart(event) < todayMonthStart);
  }, [events, segmentIndex, today]);

  if (authLoading || (loading && events.length === 0)) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: () => null, headerLargeTitle: false }} />
        <View style={[styles.screen, styles.centered]}>
          <ActivityIndicator size="large" color={theme.labelColors.primary} />
        </View>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: () => null,
            headerLargeTitle: false,
            headerTintColor: theme.labelColors.primary,
            headerLeft: ({ tintColor }) => (
              <Pressable
                onPress={() => router.push('/profile')}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.headerButtonPressed,
                ]}
                hitSlop={8}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={28}
                  color={tintColor ?? theme.labelColors.primary}
                />
              </Pressable>
            ),
          }}
        />
        <View style={[styles.screen, styles.centered]}>
          <Text style={styles.emptyTitle}>Sign in to see your saved events</Text>
          <Text style={styles.emptySubtitle}>
            Save events from the Events tab and they'll appear here.
          </Text>
          <Pressable
            onPress={() => router.push('/auth')}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <Text style={styles.ctaLabel}>Sign in with email</Text>
          </Pressable>
        </View>
      </>
    );
  }

  if (error && events.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: () => null, headerLargeTitle: false }} />
        <View style={[styles.screen, styles.centered]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => null,
          headerLargeTitle: false,
          headerTintColor: theme.labelColors.primary,
          headerLeft: ({ tintColor }) => (
            <Pressable
              onPress={() => router.push('/profile')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
              hitSlop={8}
            >
              <Ionicons
                name="person-circle-outline"
                size={28}
                color={tintColor ?? theme.labelColors.primary}
              />
            </Pressable>
          ),
          headerRight: ({ tintColor }) => (
            <Pressable
              // Saved-specific filters can be wired here later.
              onPress={() => {}}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
              hitSlop={8}
            >
              <Ionicons
                name="filter-outline"
                size={24}
                color={tintColor ?? theme.palette.headerButtonFallback}
              />
            </Pressable>
          ),
        }}
      />
      <View style={styles.screen}>
        <FlatList
          data={visibleEvents}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.labelColors.primary}
              colors={[theme.labelColors.primary]}
            />
          }
          ListHeaderComponent={
            <View style={styles.segmentedContainer}>
              <SegmentedControl
                style={styles.segmented}
                values={['Coming Up', 'Previous']}
                selectedIndex={segmentIndex}
                onChange={(event) =>
                  setSegmentIndex(event.nativeEvent.selectedSegmentIndex)
                }
                appearance={theme.isDark ? 'dark' : 'light'}
                backgroundColor={theme.isDark ? '#2c2c2e' : '#ededed'}
                tintColor={theme.isDark ? '#ffffff' : '#ffffff'}
                fontStyle={{ color: theme.labelColors.secondary }}
                activeFontStyle={{ color: theme.labelColors.primary }}
              />
            </View>
          }
          renderItem={({ item }) => (
            <SavedEventCard
              event={item}
              onPress={handlePressCard}
              style={styles.cardSpacing}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No saved events yet</Text>
              <Text style={styles.emptySubtitle}>
                Save events from the Events tab and they’ll appear here.
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.palette.screen,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: theme.labelColors.secondary,
      textAlign: 'center',
    },
    content: {
      paddingTop: 32,
      paddingHorizontal: 16,
      paddingBottom: 48,
    },
    segmentedContainer: {
      marginBottom: 24,
    },
    segmented: {
      borderRadius: 999,
      overflow: 'hidden',
    },
    row: {
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    cardSpacing: {
      // Extra style hook in case we need per-card tweaks later.
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingTop: 64,
    },
    emptyTitle: {
      ...body.emphasized,
      color: theme.labelColors.primary,
      marginBottom: 8,
    },
    emptySubtitle: {
      ...body.regular,
      color: theme.labelColors.secondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    ctaButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 999,
      backgroundColor: theme.palette.primaryButtonBackground,
    },
    ctaButtonPressed: {
      opacity: 0.8,
    },
    ctaLabel: {
      ...body.emphasized,
      color: theme.palette.primaryButtonText,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      ...(Platform.OS === 'ios'
        ? {}
        : {
            backgroundColor: theme.palette.card,
            shadowColor: theme.palette.shadowColor,
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }),
    },
    headerButtonPressed: {
      opacity: 0.7,
    },
  });
}

