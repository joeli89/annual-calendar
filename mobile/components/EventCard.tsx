/**
 * Intent: Render a premium event card UI.
 * Why: Reuse consistent card layout across the Events list.
 */
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  footnote,
  subheadline,
  title3,
  useAppTheme,
  type AppTheme,
} from '../design-system';
import { Event } from '../types/event';

/** OSM tile URL for a lat/lon so the card thumbnail shows real map imagery (no embed branding). */
function getStaticMapTileUrl(latitude: number, longitude: number, zoom = 14): string {
  const n = 2 ** zoom;
  const x = Math.floor(((longitude + 180) / 360) * n);
  const latRad = (latitude * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

type EventCardProps = {
  event: Event;
  onPress: (eventId: string) => void;
};

export function EventCard({ event, onPress }: EventCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
            {event.latitude != null && event.longitude != null ? (
              <Image
                source={{
                  uri: getStaticMapTileUrl(event.latitude, event.longitude),
                }}
                style={styles.mapImage}
              />
            ) : (
              <View style={styles.mapPlaceholder} />
            )}
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

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.palette.card,
      borderRadius: 24,
      borderWidth: 0.33,
      borderColor: theme.palette.cardBorder,
      padding: 8,
      shadowColor: theme.palette.shadowColor,
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
      borderColor: theme.palette.cardBorder,
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
      color: theme.labelColors.primary,
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
      color: theme.labelColors.primary,
    },
    locationText: {
      ...subheadline.regular,
      color: theme.labelColors.secondary,
    },
    mapWrapper: {
      width: 49,
      height: 49,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.palette.cardBorder,
      overflow: 'hidden',
    },
    mapImage: {
      width: '100%',
      height: '100%',
    },
    mapPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.palette.placeholder,
    },
    descriptionText: {
      ...footnote.regular,
      color: theme.labelColors.tertiary,
    },
    button: {
      height: 44,
      borderRadius: 999,
      backgroundColor: theme.palette.primaryButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    buttonText: {
      ...subheadline.emphasized,
      color: theme.palette.primaryButtonText,
    },
  });
}
