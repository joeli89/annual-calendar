/**
 * Intent: Render the Events list screen with a native iOS 26 liquid glass header
 * aligned to Figma (Annual-Calendar): no title, trailing pill button with menu icon only.
 * Events are loaded from Supabase when configured; otherwise mock data is used.
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';

import { Stack, useRouter } from 'expo-router';

import { EventCard } from '../../../components/EventCard';
import {
  largeTitle,
  useAppTheme,
  type AppTheme,
} from '../../../design-system';
import { Event } from '../../../types/event';
import { fetchEvents } from '../../../lib/eventsApi';

const CARD_FADE_IN_OFFSET = 16;
const CARD_FADE_IN_DURATION = 280;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Section = { title: { month: string; year: string }; data: Event[] };

function buildSections(events: Event[]): Section[] {
  const byKey = new Map<string, Event[]>();
  for (const event of events) {
    const key = `${event.year}-${event.month}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(event);
  }
  const keys = Array.from(byKey.keys()).sort();
  return keys.map((key) => {
    const [year, month] = key.split('-').map(Number);
    return {
      title: { month: MONTH_NAMES[month - 1], year: String(year) },
      data: byKey.get(key)!,
    };
  });
}

export default function EventsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const sections = useMemo(() => buildSections(events), [events]);
  const animationValuesRef = useRef(
    new Map<
      string,
      {
        opacity: Animated.Value;
        translateY: Animated.Value;
        hasAnimated: boolean;
      }
    >()
  );

  const getCardAnimationValues = (eventId: string) => {
    let values = animationValuesRef.current.get(eventId);

    if (!values) {
      values = {
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(CARD_FADE_IN_OFFSET),
        hasAnimated: false,
      };
      animationValuesRef.current.set(eventId, values);
    }

    return values;
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      viewableItems.forEach((viewableItem) => {
        if (!viewableItem.isViewable) {
          return;
        }

        const event = viewableItem.item as Event | undefined;
        if (!event?.id) {
          return;
        }

        const values = getCardAnimationValues(event.id);
        if (values.hasAnimated) {
          return;
        }

        values.hasAnimated = true;

        Animated.parallel([
          Animated.timing(values.opacity, {
            toValue: 1,
            duration: CARD_FADE_IN_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(values.translateY, {
            toValue: 0,
            duration: CARD_FADE_IN_DURATION,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  ).current;

  if (loading && events.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: () => null, headerLargeTitle: false }} />
        <View style={[styles.screen, styles.centered]}>
          <ActivityIndicator size="large" color={theme.labelColors.primary} />
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
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.labelColors.primary}
              colors={[theme.labelColors.primary]}
            />
          }
          renderSectionHeader={({ section }) => {
            const isFirstSection = section === sections[0];
            return (
              <View
                style={[
                  styles.dateHeader,
                  !isFirstSection && styles.dateHeaderAfterSection,
                ]}
              >
                <Text style={[largeTitle.regular, styles.dateMonth]}>
                  {section.title.month}
                </Text>
                <Text style={[largeTitle.regular, styles.dateYear]}>
                  {section.title.year}
                </Text>
              </View>
            );
          }}
          renderItem={({ item }) => (
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: getCardAnimationValues(item.id).opacity,
                  transform: [
                    { translateY: getCardAnimationValues(item.id).translateY },
                  ],
                },
              ]}
            >
              <EventCard
                event={item}
                onPress={(eventId) => router.push(`/events/${eventId}`)}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onViewableItemsChanged={onViewableItemsChanged}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
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
      paddingHorizontal: 16,
      paddingBottom: 48,
    },
    dateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginBottom: 24,
    },
    dateHeaderAfterSection: {
      marginTop: 40,
    },
    dateMonth: {
      color: theme.labelColors.primary,
    },
    dateYear: {
      color: theme.labelColors.secondary,
    },
    separator: {
      height: 16,
    },
    cardWrapper: {
      width: '100%',
    },
    headerSpinnerContainer: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
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
