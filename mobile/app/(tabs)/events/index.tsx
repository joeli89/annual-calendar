/**
 * Intent: Render the Events list screen with a native iOS 26 liquid glass header
 * aligned to Figma (Annual-Calendar): no title, trailing pill button with menu icon only.
 */
import { useMemo, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';

import { Stack, useRouter } from 'expo-router';

import { EventCard } from '../../../components/EventCard';
import { events } from '../../../data/events';
import {
  headline,
  largeTitle,
  useAppTheme,
  type AppTheme,
} from '../../../design-system';
import { Event } from '../../../types/event';

const CARD_FADE_IN_OFFSET = 16;
const CARD_FADE_IN_DURATION = 280;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Section = { title: { month: string; year: string }; data: Event[] };

function buildSections(): Section[] {
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

const SECTIONS = buildSections();

export default function EventsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => null,
          headerLargeTitle: false,
          headerTintColor: theme.labelColors.primary,
          headerRight: ({ tintColor }) => (
            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
              hitSlop={8}
            >
              <Text
                style={[
                  styles.headerButtonIcon,
                  { color: tintColor ?? theme.palette.headerButtonFallback },
                ]}
              >
                ≡
              </Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.screen}>
        <SectionList
          sections={SECTIONS}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => {
            const isFirstSection = section === SECTIONS[0];
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
    headerButtonIcon: {
      ...headline.regular,
    },
  });
}
