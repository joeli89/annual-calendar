/**
 * Intent: Search screen — find events by name, city, host or exhibiting brand.
 * Why: Let users quickly locate a specific watch event across the full catalogue.
 *
 * Two states per Figma (58:845): with no query the title + search bar sit centred
 * in the space between the header and the tab bar (frame 2:812); typing animates
 * them up under the header and reveals the results list (frame 2:1751).
 */
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchEvents } from '../../../lib/eventsApi';
import {
  body,
  caption1,
  footnote,
  headline,
  title1,
  useAppTheme,
} from '../../../design-system';

// "10th to 14th March 2026" -> "10th March 2026"
function getStartDateLabel(displayRange) {
  const m = displayRange?.match(/^(\S+)\s+to\s+(\S+)\s+(.+)$/);
  if (!m) return displayRange ?? '';
  const [, startDay, , monthYear] = m;
  return `${startDay} ${monthYear}`;
}

// Lower-cased searchable text for an event.
function buildHaystack(event) {
  return [
    event.title,
    event.location,
    event.address,
    event.hostName,
    event.description,
    ...(event.exhibitingBrands ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

// Liquid Glass pill on iOS 26+, frosted BlurView elsewhere.
function SearchBarSurface({ theme, style, children }) {
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={theme.isDark ? 'dark' : 'light'}
        style={style}
      >
        {children}
      </GlassView>
    );
  }
  return (
    <BlurView
      intensity={70}
      tint={theme.isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
      style={style}
    >
      {children}
    </BlurView>
  );
}

function SearchResultRow({ event, onPress, styles }) {
  const subtitle = [event.location, getStartDateLabel(event.dateRange)]
    .filter(Boolean)
    .join('  •  ');
  return (
    <Pressable
      onPress={() => onPress(event.id)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Image
        source={{ uri: event.mainImageUrl }}
        style={styles.rowImage}
        resizeMode="cover"
      />
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        {/* "Join Event" variant exists in the design; trigger unspecified — View Event everywhere until product decides. */}
        <Pressable style={styles.rowButton} onPress={() => onPress(event.id)} hitSlop={4}>
          <Text style={styles.rowButtonText}>View Event</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function SearchScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [containerHeight, setContainerHeight] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);

  // 0 = empty state (title + bar centred), 1 = results state (pinned under header).
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchEvents();
      if (!cancelled) {
        setEvents(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmed = query.trim().toLowerCase();
  const hasQuery = trimmed.length > 0;

  // Gentle critically-damped spring — no hard start/stop like a timed curve.
  useEffect(() => {
    Animated.spring(progress, {
      toValue: hasQuery ? 1 : 0,
      stiffness: 120,
      damping: 20,
      mass: 1,
      overshootClamping: true,
      restDisplacementThreshold: 0.001,
      restSpeedThreshold: 0.001,
      useNativeDriver: true,
    }).start();
  }, [hasQuery, progress]);

  const results = useMemo(() => {
    if (!trimmed) return [];
    return events.filter((e) => buildHaystack(e).includes(trimmed));
  }, [events, trimmed]);

  const handlePress = (id) => {
    Keyboard.dismiss();
    router.push(`/events/${id}`);
  };

  // How far down the title + search bar sit when the query is empty:
  // vertically centred in the space between the header and the tab bar.
  // Hidden until both heights are measured so it doesn't flash at the top.
  // The container extends under the native tab bar, so subtract its footprint
  // (standard 49pt bar + bottom safe-area inset) before centring.
  // 0.85 biases the block above true centre to match the Figma optical
  // position (title y=337 in an 852-tall frame, ~40% down the screen).
  const tabBarAllowance = 49 + insets.bottom;
  const measured = containerHeight > 0 && blockHeight > 0;
  const centerOffset = Math.max(
    0,
    ((containerHeight - tabBarAllowance - blockHeight) / 2) * 0.85,
  );
  const blockTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [centerOffset, 0],
  });
  // The list waits for the block to be mostly up, then fades in while
  // drifting the last few points — softer than appearing in lockstep.
  const listOpacity = progress.interpolate({
    inputRange: [0.35, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const listTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

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
                style={styles.headerButtonIcon}
              />
            </Pressable>
          ),
        }}
      />
      <View
        style={[styles.screen, { paddingTop: headerHeight }]}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height - headerHeight)}
      >
        <Animated.View
          style={[
            styles.headerBlock,
            { opacity: measured ? 1 : 0, transform: [{ translateY: blockTranslateY }] },
          ]}
          onLayout={(e) => setBlockHeight(e.nativeEvent.layout.height)}
        >
          <Text style={styles.pageTitle}>Search</Text>
          {/* Native iOS 26 Liquid Glass; frosted BlurView fallback on older iOS.
              The outer wrapper carries the soft shadow (and, for the fallback,
              a translucent fill) so the pill stays legible against the
              near-white screen (Figma 2:812). */}
          <View
            style={[
              styles.searchBarShadow,
              isLiquidGlassAvailable() && styles.searchBarShadowGlass,
            ]}
          >
            <SearchBarSurface theme={theme} style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.labelColors.secondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search events, cities, brands"
              placeholderTextColor={theme.labelColors.tertiary}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.labelColors.tertiary}
                />
              </Pressable>
            ) : null}
            {/* Decorative per design; dictation not wired up, so no press state. */}
            <Ionicons
              name="mic-outline"
              size={18}
              color={theme.labelColors.secondary}
            />
            </SearchBarSurface>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.listWrapper,
            { opacity: listOpacity, transform: [{ translateY: listTranslateY }] },
          ]}
          pointerEvents={hasQuery ? 'auto' : 'none'}
        >
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SearchResultRow event={item} onPress={handlePress} styles={styles} />
            )}
            ListEmptyComponent={
              !hasQuery ? null : loading && events.length === 0 ? (
                <View style={styles.stateBlock}>
                  <ActivityIndicator size="large" color={theme.labelColors.primary} />
                </View>
              ) : (
                <View style={styles.stateBlock}>
                  <Text style={styles.stateTitle}>No events found</Text>
                  <Text style={styles.stateSubtitle}>
                    Nothing matches “{query.trim()}”. Try a different name, city, or
                    brand.
                  </Text>
                </View>
              )
            }
          />
        </Animated.View>
      </View>
    </>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.palette.screen,
    },
    headerBlock: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
      gap: 12,
      zIndex: 1,
    },
    pageTitle: {
      ...title1.emphasized,
      color: theme.labelColors.primary,
    },
    searchBarShadow: {
      borderRadius: 999,
      backgroundColor: theme.isDark
        ? 'rgba(44, 44, 46, 0.55)'
        : 'rgba(255, 255, 255, 0.6)',
      shadowColor: theme.palette.shadowColor,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    // Liquid Glass draws its own material — a fill behind it would dull it.
    searchBarShadowGlass: {
      backgroundColor: 'transparent',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: 48,
      borderRadius: 999,
      overflow: 'hidden',
      paddingHorizontal: 16,
    },
    searchInput: {
      flex: 1,
      ...body.regular,
      color: theme.labelColors.primary,
      padding: 0,
    },
    listWrapper: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 48,
      flexGrow: 1,
    },
    // Card per Figma: 361x120, image 100x100 at (8,8), content column at x=124.
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 120,
      backgroundColor: theme.palette.cardMuted,
      borderRadius: 24,
      borderWidth: 0.33,
      borderColor: theme.palette.cardBorder,
      padding: 8,
      marginBottom: 12,
    },
    rowPressed: {
      opacity: 0.85,
    },
    rowImage: {
      width: 100,
      height: 100,
      borderRadius: 16,
      backgroundColor: theme.palette.placeholder,
    },
    rowContent: {
      flex: 1,
      marginLeft: 16,
      paddingRight: 4,
    },
    rowTitle: {
      ...headline.regular,
      color: theme.labelColors.primary,
    },
    rowSubtitle: {
      ...caption1.regular,
      color: theme.labelColors.secondary,
      marginTop: 4,
    },
    rowButton: {
      alignSelf: 'flex-start',
      height: 32,
      justifyContent: 'center',
      backgroundColor: theme.palette.primaryButtonBackground,
      borderRadius: 999,
      paddingHorizontal: 16,
      marginTop: 22,
    },
    rowButtonText: {
      ...footnote.emphasized,
      color: theme.palette.primaryButtonText,
    },
    stateBlock: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 56,
      paddingHorizontal: 24,
      gap: 8,
    },
    stateTitle: {
      ...body.emphasized,
      color: theme.labelColors.primary,
    },
    stateSubtitle: {
      ...body.regular,
      color: theme.labelColors.secondary,
      textAlign: 'center',
    },
    // Optical correction: the glyph's font box carries descender space that
    // sits it ~4pt low inside the native glass capsule.
    headerButtonIcon: {
      marginTop: -4,
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
