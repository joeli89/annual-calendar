/**
 * Intent: Render a single event detail screen from existing event data.
 * Why: Match the Figma event detail layout without changing shared data contracts.
 */
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { events } from '../../data/events';
/**
 * Intent: Pull in title2 typography for date metadata text.
 * Why: Prevent runtime access errors and match the design scale.
 */
import {
  body,
  subheadline,
  title1,
  title2,
  title3,
  useAppTheme,
  type AppTheme,
} from '../../design-system';

const HERO_HEIGHT = 485;
const INITIAL_DESCRIPTION_LINES = 2;
const SHEET_ENTRY_SECTION_COUNT = 5;
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

function getGoogleMapsEmbedUrl(location: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&z=13&output=embed`;
}

/**
 * Intent: Render the event's start and end dates as a standalone summary card.
 * Why: Match the provided detail-screen layout without changing shared event data.
 */
type EventDetailStyles = ReturnType<typeof createStyles>;

function EventDateCard({
  dateRange,
  styles,
}: {
  dateRange: string;
  styles: EventDetailStyles;
}) {
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
        <Text style={[styles.dateLabel, styles.dateTextEnd]}>Ends</Text>
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
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = normalizeParam(id);
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroListRef = useRef<FlatList<string> | null>(null);
  const sheetScrollY = useRef(new Animated.Value(0)).current;
  const sheetSectionEnterValues = useRef(
    Array.from(
      { length: SHEET_ENTRY_SECTION_COUNT },
      () => new Animated.Value(0)
    )
  ).current;

  const event = useMemo(
    () => events.find((item) => item.id === eventId),
    [eventId]
  );

  useEffect(() => {
    sheetSectionEnterValues.forEach((value) => value.setValue(0));
    const animation = Animated.stagger(
      80,
      sheetSectionEnterValues.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    );
    animation.start();
    return () => animation.stop();
  }, [eventId]);

  if (!event) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Event',
            headerTransparent: true,
            headerBlurEffect: 'systemMaterial',
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: theme.labelColors.primary,
          }}
        />
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
  const shareMessage = [
    event.title,
    `${event.dateRange} • ${event.location}`,
    event.description,
  ].join('\n\n');
  const handleShareEvent = async () => {
    try {
      await Share.share({
        title: event.title,
        message: shareMessage,
      });
    } catch (error) {
      console.warn('Unable to open share sheet', error);
    }
  };
  const heroImages = [event.mainImageUrl, ...event.sideImageUrls];
  const infiniteHeroImages = useMemo(
    () => [...heroImages, ...heroImages, ...heroImages],
    [event.id]
  );
  const heroWidth = Dimensions.get('window').width;
  const sheetShadowOpacity = sheetScrollY.interpolate({
    inputRange: [0, 64],
    outputRange: [0.06, 0.18],
    extrapolate: 'clamp',
  });
  const sheetShadowRadius = sheetScrollY.interpolate({
    inputRange: [0, 64],
    outputRange: [8, 16],
    extrapolate: 'clamp',
  });
  const sheetElevation = sheetScrollY.interpolate({
    inputRange: [0, 64],
    outputRange: [2, 10],
    extrapolate: 'clamp',
  });
  const grabHandleOpacity = sheetScrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.45],
    extrapolate: 'clamp',
  });
  const grabHandleScale = sheetScrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.86],
    extrapolate: 'clamp',
  });
  const heroParallaxTranslateY = sheetScrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, -HERO_HEIGHT * 0.22],
    extrapolate: 'clamp',
  });
  const heroParallaxScale = sheetScrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [1, 1.08],
    extrapolate: 'clamp',
  });
  const heroParallaxOpacity = sheetScrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.92],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const sheetSectionEntryStyles = sheetSectionEnterValues.map((value) => ({
    opacity: value,
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [32, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
  }));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTitle: () => null,
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: theme.labelColors.primary,
          scrollEdgeEffects: { top: 'automatic' },
          unstable_headerRightItems: () => [
            {
              type: 'custom',
              hidesSharedBackground: true,
              element: (
                <Pressable
                  accessibilityLabel="Share event"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={handleShareEvent}
                  style={({ pressed }) => [
                    styles.nativeHeaderButton,
                    pressed && styles.toolbarButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={theme.labelColors.primary}
                    name="share-outline"
                    size={18}
                  />
                </Pressable>
              ),
            },
            {
              type: 'spacing',
              spacing: 10,
            },
            {
              type: 'custom',
              hidesSharedBackground: true,
              element: (
                <Pressable
                  accessibilityLabel="Save event"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {}}
                  style={({ pressed }) => [
                    styles.nativeHeaderButton,
                    pressed && styles.toolbarButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={theme.labelColors.primary}
                    name="heart-outline"
                    size={18}
                  />
                </Pressable>
              ),
            },
          ],
        }}
      />
      <View style={styles.screen}>
        <Animated.ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: sheetScrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <Animated.View
            style={[
              styles.card,
              {
                shadowOpacity: sheetShadowOpacity,
                shadowRadius: sheetShadowRadius,
                elevation: sheetElevation,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.grabHandle,
                {
                  opacity: grabHandleOpacity,
                  transform: [{ scaleX: grabHandleScale }],
                },
              ]}
            />
            <Animated.View style={sheetSectionEntryStyles[0]}>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.location}>{event.location}</Text>
              </View>
            </Animated.View>

            <Animated.View style={sheetSectionEntryStyles[1]}>
              <EventDateCard dateRange={event.dateRange} styles={styles} />
            </Animated.View>

            <View style={styles.separator} />

            <Animated.View style={sheetSectionEntryStyles[2]}>
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
                        color={theme.labelColors.primary}
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
            </Animated.View>

            <View style={styles.separator} />

            <Animated.View style={sheetSectionEntryStyles[3]}>
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
            </Animated.View>

            <View style={styles.separator} />

            <Animated.View style={sheetSectionEntryStyles[4]}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Where it will be</Text>
                <Text style={styles.sectionLocation}>{event.location}</Text>

                <View style={styles.mapCard}>
                  <WebView
                    originWhitelist={['*']}
                    scrollEnabled={false}
                    source={{ uri: getGoogleMapsEmbedUrl(event.location) }}
                    style={styles.mapWebView}
                  />
                  <View style={styles.mapPin}>
                    <Ionicons
                      color="#ffffff"
                      name="location"
                      size={20}
                    />
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
                      color={theme.labelColors.primary}
                      name="expand-outline"
                      size={18}
                    />
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.ScrollView>

        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.heroParallaxLayer,
              {
                opacity: heroParallaxOpacity,
                transform: [
                  { translateY: heroParallaxTranslateY },
                  { scale: heroParallaxScale },
                ],
              },
            ]}
          >
            <FlatList
              ref={heroListRef}
              data={infiniteHeroImages}
              keyExtractor={(_, index) => `hero-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={heroImages.length}
              getItemLayout={(_, index) => ({
                length: heroWidth,
                offset: heroWidth * index,
                index,
              })}
              onMomentumScrollEnd={(e) => {
                const offset = e.nativeEvent.contentOffset.x;
                const currentIndex = Math.round(offset / heroWidth);
                const count = infiniteHeroImages.length;
                setHeroIndex(currentIndex % heroImages.length);
                if (currentIndex === 0) {
                  heroListRef.current?.scrollToOffset({
                    offset: heroWidth * heroImages.length,
                    animated: false,
                  });
                } else if (currentIndex === count - 1) {
                  heroListRef.current?.scrollToOffset({
                    offset: heroWidth * (heroImages.length * 2 - 1),
                    animated: false,
                  });
                }
              }}
              renderItem={({ item }) => (
                <View style={[styles.heroSlide, { width: heroWidth }]}>
                  <Image source={{ uri: item }} style={styles.heroImage} />
                </View>
              )}
            />
          </Animated.View>

          <View style={styles.pageControl}>
            {heroImages.map((_, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  styles.pageDot,
                  index === heroIndex
                    ? styles.pageDotActive
                    : styles.pageDotInactive,
                ]}
              />
            ))}
          </View>
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
      position: 'relative',
    },
    heroSection: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: HERO_HEIGHT,
      zIndex: 0,
      overflow: 'hidden',
    },
    heroParallaxLayer: {
      height: '100%',
    },
    scrollView: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: HERO_HEIGHT - 36,
      bottom: 0,
      zIndex: 1,
      overflow: 'visible',
    },
    scrollContent: {
      paddingBottom: 32,
    },
    heroSlide: {
      height: HERO_HEIGHT,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    nativeHeaderButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.frostedSurface,
    },
    toolbarButtonPressed: {
      opacity: 0.72,
    },
    pageControl: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 56,
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
      backgroundColor: theme.palette.pageDotActive,
    },
    pageDotInactive: {
      backgroundColor: theme.palette.pageDotInactive,
    },
    card: {
      backgroundColor: theme.palette.card,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 32,
      gap: 24,
      shadowColor: theme.palette.shadowColor,
      shadowOffset: {
        width: 0,
        height: -4,
      },
    },
    grabHandle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: theme.labelColors.quaternary,
      marginBottom: 12,
    },
    titleBlock: {
      alignItems: 'center',
      gap: 8,
    },
    title: {
      ...title1.emphasized,
      color: theme.labelColors.primary,
      textAlign: 'center',
    },
    location: {
      ...subheadline.regular,
      color: theme.labelColors.secondary,
      textAlign: 'center',
    },
    dateCard: {
      minHeight: 136,
      borderRadius: 28,
      backgroundColor: theme.palette.cardMuted,
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
      color: theme.labelColors.primary,
      textAlign: 'left',
    },
    dateValue: {
      ...title3.regular,
      color: theme.labelColors.primary,
      textAlign: 'left',
    },
    dateMeta: {
      /**
       * Intent: Reduce year emphasis in the date card.
       * Why: Match the reference by making the year smaller and secondary.
       */
      ...subheadline.regular,
      color: theme.labelColors.secondary,
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
      backgroundColor: theme.palette.separator,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.palette.separator,
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
      color: theme.labelColors.primary,
      textAlign: 'center',
    },
    actionSeparator: {
      width: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      backgroundColor: theme.palette.separator,
    },
    section: {
      gap: 16,
    },
    description: {
      ...body.regular,
      color: theme.labelColors.primary,
    },
    readMoreButton: {
      minHeight: 40,
      borderRadius: 8,
      backgroundColor: theme.palette.control,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    readMoreButtonPressed: {
      opacity: 0.72,
    },
    readMoreText: {
      ...body.regular,
      color: theme.labelColors.secondary,
      textAlign: 'center',
    },
    sectionTitle: {
      ...title3.emphasized,
      color: theme.labelColors.primary,
    },
    sectionLocation: {
      ...subheadline.regular,
      color: theme.labelColors.secondary,
    },
    mapCard: {
      height: 348,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.palette.cardBorder,
      position: 'relative',
      backgroundColor: theme.palette.placeholder,
    },
    mapImage: {
      width: '100%',
      height: '100%',
    },
    mapWebView: {
      flex: 1,
      backgroundColor: theme.palette.placeholder,
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
      backgroundColor: theme.palette.frostedSurface,
    },
    notFoundScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: theme.palette.screen,
      gap: 8,
    },
    notFoundTitle: {
      ...title3.emphasized,
      color: theme.labelColors.primary,
      textAlign: 'center',
    },
    notFoundText: {
      ...subheadline.regular,
      color: theme.labelColors.secondary,
      textAlign: 'center',
    },
  });
}
