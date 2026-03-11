/**
 * Intent: Render a single event detail screen from existing event data.
 * Why: Match the Figma event detail layout without changing shared data contracts.
 */
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

import { EventDateCard } from '../../components/EventDateCard';
import { EventMap } from '../../components/EventMap';
import {
  fetchEventById,
  isEventFavorited,
  toggleFavorite,
} from '../../lib/eventsApi';
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

function getGoogleMapsEmbedUrl(location: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&z=13&output=embed`;
}

const DEFAULT_MAP_LAT = 51.5074;
const DEFAULT_MAP_LNG = -0.1278;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = normalizeParam(id);
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [event, setEvent] = useState<Awaited<ReturnType<typeof fetchEventById>>>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroListRef = useRef<FlatList<string> | null>(null);
  const sheetScrollY = useRef(new Animated.Value(0)).current;
  const sheetSectionEnterValues = useRef(
    Array.from(
      { length: SHEET_ENTRY_SECTION_COUNT },
      () => new Animated.Value(0)
    )
  ).current;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchEventById(eventId ?? '');
      if (!cancelled) setEvent(data);
      if (data) {
        const favorited = await isEventFavorited(data.id);
        if (!cancelled) setIsFavorited(favorited);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleToggleFavorite = async () => {
    if (!event) return;
    const result = await toggleFavorite(event.id);
    setIsFavorited(result.favorited);
  };

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

  if (loading && !event) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Event',
            headerTransparent: true,
            headerTintColor: theme.labelColors.primary,
          }}
        />
        <View style={[styles.notFoundScreen, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={theme.labelColors.primary} />
        </View>
      </>
    );
  }

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
  const heroImages = [event.mainImageUrl, ...event.sideImageUrls];
  const infiniteHeroImages = [...heroImages, ...heroImages, ...heroImages];

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
  const mapLatitude = event.latitude ?? DEFAULT_MAP_LAT;
  const mapLongitude = event.longitude ?? DEFAULT_MAP_LNG;
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
          headerBackVisible: !isMapExpanded,
          headerLeft: isMapExpanded ? () => null : undefined,
          headerBackButtonDisplayMode: 'minimal',
          headerBackTitle: '',
          headerTintColor: theme.labelColors.primary,
          scrollEdgeEffects: { top: 'automatic' },
          headerRight: () =>
            isMapExpanded ? (
              <Pressable
                accessibilityLabel="Close map"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setIsMapExpanded(false)}
                style={({ pressed }) => [
                  styles.nativeHeaderButton,
                  pressed && styles.toolbarButtonPressed,
                ]}
              >
                <Ionicons
                  color={theme.labelColors.primary}
                  name="close"
                  size={24}
                />
              </Pressable>
            ) : (
              <View style={styles.headerRightContainer}>
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
                    size={24}
                  />
                </Pressable>
                <Pressable
                  accessibilityLabel={isFavorited ? 'Unsave event' : 'Save event'}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={handleToggleFavorite}
                  style={({ pressed }) => [
                    styles.nativeHeaderButton,
                    pressed && styles.toolbarButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={theme.labelColors.primary}
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={24}
                  />
                </Pressable>
              </View>
            ),
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
              <EventDateCard dateRange={event.dateRange} />
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
                  <EventMap
                    latitude={mapLatitude}
                    longitude={mapLongitude}
                    zoom={15}
                  />
                  <Pressable
                    accessibilityLabel="Expand map"
                    accessibilityRole="button"
                    onPress={() => setIsMapExpanded(true)}
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

        {isMapExpanded && (
          <View style={styles.fullScreenMapOverlay}>
            <EventMap
              latitude={mapLatitude}
              longitude={mapLongitude}
              variant="fullscreen"
              zoom={15}
            />
          </View>
        )}
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
    headerRightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    nativeHeaderButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
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
      borderRadius: 24,
      overflow: 'hidden',
      borderColor: theme.palette.cardBorder,
      position: 'relative',
      backgroundColor: theme.palette.placeholder,
      height: 350,
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
    fullScreenMapOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 3,
      backgroundColor: theme.palette.screen,
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
