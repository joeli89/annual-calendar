/**
 * Intent: Render a single event detail screen from existing event data.
 * Why: Match the Figma event detail layout without changing shared data contracts.
 */
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { events } from '../../data/events';
/**
 * Intent: Pull in title2 typography for date metadata text.
 * Why: Prevent runtime access errors and match the design scale.
 */
import {
  body,
  grays,
  labelColorsLight,
  strokes,
  subheadline,
  title1,
  title2,
  title3,
} from '../../design-system';

const HERO_HEIGHT = 485;
const IMAGE_DOT_COUNT = 6;
const INITIAL_DESCRIPTION_LINES = 2;
const MONTH_INDEX: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

type LinkAction = {
  key: 'website' | 'instagram' | 'x';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const LINK_ACTIONS: LinkAction[] = [
  { key: 'website', label: 'Website', icon: 'globe-outline' },
  { key: 'instagram', label: 'Instagram', icon: 'link-outline' },
  { key: 'x', label: 'X', icon: 'attach-outline' },
];

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function removeOrdinalSuffix(value: string) {
  return value.replace(/(st|nd|rd|th)$/i, '');
}

function formatDayMonth(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function formatYear(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
  }).format(date);
}

function getEventDateRange(dateRange: string) {
  const match = dateRange.match(
    /^(\d{1,2}(?:st|nd|rd|th)?)\s+to\s+(\d{1,2}(?:st|nd|rd|th)?)\s+([A-Za-z]+)\s+(\d{4})$/i
  );

  if (!match) {
    return null;
  }

  const [, startDayToken, endDayToken, monthToken, yearToken] = match;
  const monthIndex = MONTH_INDEX[monthToken.toLowerCase()];

  if (monthIndex === undefined) {
    return null;
  }

  const startDay = Number(removeOrdinalSuffix(startDayToken));
  const endDay = Number(removeOrdinalSuffix(endDayToken));
  const year = Number(yearToken);

  if (
    Number.isNaN(startDay) ||
    Number.isNaN(endDay) ||
    Number.isNaN(year)
  ) {
    return null;
  }

  return {
    start: new Date(year, monthIndex, startDay),
    end: new Date(year, monthIndex, endDay),
  };
}

/**
 * Intent: Render the event's start and end dates as a standalone summary card.
 * Why: Match the provided detail-screen layout without changing shared event data.
 */
function EventDateCard({ dateRange }: { dateRange: string }) {
  const parsedRange = getEventDateRange(dateRange);

  return (
    <View style={styles.dateCard}>
      <View style={styles.dateColumn}>
        <Text style={styles.dateLabel}>Start</Text>
        <Text style={styles.dateValue}>
          {parsedRange ? formatDayMonth(parsedRange.start) : dateRange}
        </Text>
        <Text style={styles.dateMeta}>
          {parsedRange ? formatYear(parsedRange.start) : ' '}
        </Text>
      </View>

      <View style={styles.dateDivider} />

      <View style={[styles.dateColumn, styles.dateColumnEnd]}>
        <Text style={[styles.dateLabel, styles.dateTextEnd]}>ends</Text>
        <Text style={[styles.dateValue, styles.dateTextEnd]}>
          {parsedRange ? formatDayMonth(parsedRange.end) : 'Date unavailable'}
        </Text>
        <Text style={[styles.dateMeta, styles.dateTextEnd]}>
          {parsedRange ? formatYear(parsedRange.end) : ' '}
        </Text>
      </View>
    </View>
  );
}

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = normalizeParam(id);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const event = useMemo(
    () => events.find((item) => item.id === eventId),
    [eventId]
  );

  if (!event) {
    return (
      <>
        <Stack.Screen options={{ title: 'Event' }} />
        <View style={styles.notFoundScreen}>
          <Text style={styles.notFoundTitle}>Event not found</Text>
          <Text style={styles.notFoundText}>
            The selected event could not be loaded.
          </Text>
        </View>
      </>
    );
  }

  const description = `${event.description}\n\n${event.description}`;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.screen}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <Image source={{ uri: event.mainImageUrl }} style={styles.heroImage} />

            <View style={styles.topToolbar}>
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.toolbarButton,
                  pressed && styles.toolbarButtonPressed,
                ]}
              >
                <Ionicons
                  color={labelColorsLight.primary}
                  name="chevron-back"
                  size={22}
                />
              </Pressable>

              <View style={styles.toolbarTrailing}>
                <Pressable
                  accessibilityLabel="Share event"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {}}
                  style={({ pressed }) => [
                    styles.toolbarButton,
                    pressed && styles.toolbarButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={labelColorsLight.primary}
                    name="share-outline"
                    size={20}
                  />
                </Pressable>

                <Pressable
                  accessibilityLabel="Save event"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {}}
                  style={({ pressed }) => [
                    styles.toolbarButton,
                    pressed && styles.toolbarButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={labelColorsLight.primary}
                    name="heart-outline"
                    size={20}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.pageControl}>
              {Array.from({ length: IMAGE_DOT_COUNT }).map((_, index) => (
                <View
                  key={`dot-${index + 1}`}
                  style={[
                    styles.pageDot,
                    index === 0 ? styles.pageDotActive : styles.pageDotInactive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.location}>{event.location}</Text>
            </View>

            <EventDateCard dateRange={event.dateRange} />

            <View style={styles.separator} />

            <View style={styles.actionsRow}>
              {LINK_ACTIONS.map((action, index) => (
                <View key={action.key} style={styles.actionCellWrapper}>
                  <Pressable
                    accessibilityLabel={action.label}
                    accessibilityRole="button"
                    onPress={() => {}}
                    style={({ pressed }) => [
                      styles.actionCell,
                      pressed && styles.actionCellPressed,
                    ]}
                  >
                    <Ionicons
                      color={labelColorsLight.primary}
                      name={action.icon}
                      size={18}
                    />
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </Pressable>
                  {index < LINK_ACTIONS.length - 1 ? (
                    <View style={styles.actionSeparator} />
                  ) : null}
                </View>
              ))}
            </View>

            <View style={styles.separator} />

            <View style={styles.section}>
              <Text
                numberOfLines={isDescriptionExpanded ? undefined : INITIAL_DESCRIPTION_LINES}
                style={styles.description}
              >
                {description}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsDescriptionExpanded((value) => !value)}
                style={({ pressed }) => [
                  styles.readMoreButton,
                  pressed && styles.readMoreButtonPressed,
                ]}
              >
                <Text style={styles.readMoreText}>
                  {isDescriptionExpanded ? 'read less' : 'read more'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.separator} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Where it will be</Text>
              <Text style={styles.sectionLocation}>{event.location}</Text>

              <View style={styles.mapCard}>
                <Image source={{ uri: event.mapImageUrl }} style={styles.mapImage} />
                <View style={styles.mapPin}>
                  <Ionicons color={grays.white} name="location" size={20} />
                </View>
                <Pressable
                  accessibilityLabel="Expand map"
                  accessibilityRole="button"
                  onPress={() => {}}
                  style={({ pressed }) => [
                    styles.mapButton,
                    pressed && styles.toolbarButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={labelColorsLight.primary}
                    name="expand-outline"
                    size={18}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  content: {
    paddingBottom: 32,
  },
  heroSection: {
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topToolbar: {
    position: 'absolute',
    top: 62,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.86)',
  },
  toolbarButtonPressed: {
    opacity: 0.72,
  },
  pageControl: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  pageDotActive: {
    backgroundColor: labelColorsLight.primary,
  },
  pageDotInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  card: {
    marginTop: -36,
    backgroundColor: grays.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 24,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...title1.emphasized,
    color: labelColorsLight.primary,
    textAlign: 'center',
  },
  location: {
    ...subheadline.regular,
    color: labelColorsLight.secondary,
    textAlign: 'center',
  },
  dateCard: {
    minHeight: 136,
    borderRadius: 28,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 28,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dateColumn: {
    flex: 1,
    /**
     * Intent: Align date text consistently to the left.
     * Why: Match the reference layout for the right column.
     */
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  dateLabel: {
    ...title3.emphasized,
    color: labelColorsLight.primary,
    textAlign: 'left',
  },
  dateValue: {
    ...title3.regular,
    color: labelColorsLight.primary,
    textAlign: 'left',
  },
  dateMeta: {
    /**
     * Intent: Reduce year emphasis in the date card.
     * Why: Match the reference by making the year smaller and secondary.
     */
    ...subheadline.regular,
    color: labelColorsLight.secondary,
    textAlign: 'left',
  },
  dateColumnEnd: {
    alignItems: 'flex-end',
  },
  dateTextEnd: {
    textAlign: 'right',
  },
  dateDivider: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: 28,
    backgroundColor: labelColorsLight.quaternary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: labelColorsLight.quaternary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  actionCellWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionCellPressed: {
    opacity: 0.72,
  },
  actionLabel: {
    ...subheadline.regular,
    color: labelColorsLight.primary,
    textAlign: 'center',
  },
  actionSeparator: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: labelColorsLight.quaternary,
  },
  section: {
    gap: 16,
  },
  description: {
    ...body.regular,
    color: labelColorsLight.primary,
  },
  readMoreButton: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  readMoreButtonPressed: {
    opacity: 0.72,
  },
  readMoreText: {
    ...body.regular,
    color: labelColorsLight.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...title3.emphasized,
    color: labelColorsLight.primary,
  },
  sectionLocation: {
    ...subheadline.regular,
    color: labelColorsLight.secondary,
  },
  mapCard: {
    height: 348,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: strokes.section,
    position: 'relative',
    backgroundColor: '#d9d9d9',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPin: {
    position: 'absolute',
    top: '38%',
    left: '48%',
    marginLeft: -12,
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButton: {
    position: 'absolute',
    right: 9,
    bottom: 9,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.86)',
  },
  notFoundScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f6f6f6',
    gap: 8,
  },
  notFoundTitle: {
    ...title3.emphasized,
    color: labelColorsLight.primary,
    textAlign: 'center',
  },
  notFoundText: {
    ...subheadline.regular,
    color: labelColorsLight.secondary,
    textAlign: 'center',
  },
});
