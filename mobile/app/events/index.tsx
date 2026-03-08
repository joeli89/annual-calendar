/**
 * Intent: Render the Events list screen with a native iOS 26 liquid glass header
 * aligned to Figma (Annual-Calendar): no title, trailing pill button with menu icon only.
 */
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Stack } from 'expo-router';

import { EventCard } from '../../components/EventCard';
import { events } from '../../data/events';
import { grays, headline, labelColorsLight, largeTitle } from '../../design-system';

/** Figma: Toolbar trailing button — 44pt pill, 17pt icon (labels/controls primary #404040). */
const HEADER_BUTTON_ICON_COLOR = '#404040';

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
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.dateHeader}>
              <Text style={[largeTitle.regular, styles.dateMonth]}>
                February
              </Text>
              <Text style={[largeTitle.regular, styles.dateYear]}>2026</Text>
            </View>
          }
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
