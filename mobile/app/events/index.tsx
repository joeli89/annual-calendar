/**
 * Intent: Render the Events list screen with a native iOS 26 liquid glass header.
 * Why: Stack provides native large title that collapses on scroll and gets liquid glass on iOS 26.
 */
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EventCard } from '../../components/EventCard';
import { EventsHeader } from '../../components/EventsHeader';
import { events } from '../../data/events';
import { grays, labelColorsLight, largeTitle } from '../../design-system';

export default function EventsScreen() {
  return (
    <>
      <EventsHeader />
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
    backgroundColor: grays.white,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
});
