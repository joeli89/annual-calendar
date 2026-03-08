/**
 * Intent: Render the Events list screen with a native iOS 26 liquid glass header
 * aligned to Figma (Annual-Calendar): no title, trailing pill button with menu icon only.
 */
import {
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Stack } from 'expo-router';

import { EventCard } from '../../components/EventCard';
import { events } from '../../data/events';
import { grays, headline, labelColorsLight, largeTitle } from '../../design-system';
import { Event } from '../../types/event';

/** Figma: Toolbar trailing button — 44pt pill, 17pt icon (labels/controls primary #404040). */
const HEADER_BUTTON_ICON_COLOR = '#404040';

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
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => null,
          headerLargeTitle: false,
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
                  { color: tintColor ?? HEADER_BUTTON_ICON_COLOR },
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
            <EventCard
              event={item}
              onPress={(eventId) => console.log(`Event pressed: ${eventId}`)}
            />
          )}
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
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
    paddingHorizontal: 24,
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
    color: labelColorsLight.primary,
  },
  dateYear: {
    color: labelColorsLight.secondary,
  },
  separator: {
    height: 16,
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
          backgroundColor: grays.white,
          shadowColor: grays.black,
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
