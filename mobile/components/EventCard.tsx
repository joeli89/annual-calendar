/**
 * Intent: Render a premium event card UI.
 * Why: Reuse consistent card layout across the Events list.
 */
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  grays,
  labelColorsLight,
  strokes,
  footnote,
  subheadline,
  title3,
} from '../design-system';
import { Event } from '../types/event';

type EventCardProps = {
  event: Event;
  onPress: (eventId: string) => void;
};

export function EventCard({ event, onPress }: EventCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageRow}>
        <View style={styles.mainImageWrapper}>
          <Image source={{ uri: event.mainImageUrl }} style={styles.mainImage} />
        </View>
        <View style={styles.sideImages}>
          <View style={styles.sideImageTop}>
            <Image source={{ uri: event.sideImageUrls[0] }} style={styles.sideImage} />
          </View>
          <View style={styles.sideImageBottom}>
            <Image source={{ uri: event.sideImageUrls[1] }} style={styles.sideImage} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.dateText}>{event.dateRange}</Text>

        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.titleText}>{event.title}</Text>
            <Text style={styles.locationText}>{event.location}</Text>
          </View>
          <View style={styles.mapWrapper}>
            <Image source={{ uri: event.mapImageUrl }} style={styles.mapImage} />
          </View>
        </View>

        <Text style={styles.descriptionText} numberOfLines={2}>
          {event.description}
        </Text>

        <Pressable style={styles.button} onPress={() => onPress(event.id)}>
          <Text style={styles.buttonText}>View Event</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: grays.white,
    borderRadius: 24,
    borderWidth: .33,
    borderColor: strokes.section,
    padding: 8,
    shadowColor: grays.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    paddingBottom: 12,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 4,
  },
  mainImageWrapper: {
    flex: 2,
    aspectRatio: 232 / 256,
    borderRadius: 16,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: strokes.section,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  sideImages: {
    flex: 1,
    gap: 4,
  },
  sideImageTop: {
    flex: 1,
    borderRadius: 4,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  sideImageBottom: {
    flex: 1,
    borderRadius: 4,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingTop: 16,
    paddingHorizontal: 8,
    gap: 12,
  },
  dateText: {
    ...subheadline.emphasized,
    color: labelColorsLight.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  titleText: {
    ...title3.emphasized,
    color: labelColorsLight.primary,
  },
  locationText: {
    ...subheadline.regular,
    color: labelColorsLight.secondary,
  },
  mapWrapper: {
    width: 49,
    height: 49,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: strokes.section,
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  descriptionText: {
    ...footnote.regular,
    color: labelColorsLight.tertiary,
  },
  button: {
    height: 44,
    borderRadius: 999,
    backgroundColor: grays.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    ...subheadline.emphasized,
    color: grays.white,
  },
});
