/**
 * Intent: Render the Events list screen with premium styling.
 * Why: Replace the placeholder screen with a designed layout.
 */
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EventCard } from '../components/EventCard';
import { events } from '../data/events';

export default function EventsScreen() {
  return (
    <View style={styles.screen}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={(eventId) => console.log(`Event pressed: ${eventId}`)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>February</Text>
              <Text style={styles.titleYear}>2026</Text>
            </View>
            <Pressable style={styles.headerButton} onPress={() => {}}>
              <Text style={styles.headerButtonIcon}>≡</Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: 0.4,
    color: '#000000',
    fontWeight: '400',
  },
  titleYear: {
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: 0.4,
    color: '#b7b7b7',
    fontWeight: '400',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  headerButtonIcon: {
    fontSize: 18,
    color: '#404040',
    fontWeight: '600',
  },
  separator: {
    height: 16,
  },
});
