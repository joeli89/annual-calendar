/**
 * Intent: Render the compact Saved grid card UI from Figma.
 * Why: Reuse a dedicated Saved card style on the Saved tab without impacting the main EventCard.
 */
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import {
  subheadline,
  caption1,
  useAppTheme,
  type AppTheme,
} from '../design-system';
import type { Event } from '../types/event';

// Format a single start date label from a display range like
// "10th to 14th March 2026" → "10th March 2026".
function getStartDateLabel(displayRange: string): string {
  const rangeMatch = displayRange.match(/^(\S+)\s+to\s+(\S+)\s+(.+)$/);
  if (!rangeMatch) {
    return displayRange;
  }
  const [, startDay, , monthYear] = rangeMatch;
  return `${startDay} ${monthYear}`;
}

type SavedEventCardProps = {
  event: Event;
  onPress: (eventId: string) => void;
  style?: ViewStyle;
};

export function SavedEventCard({
  event,
  onPress,
  style,
}: SavedEventCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      onPress={() => onPress(event.id)}
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: event.mainImageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.date} numberOfLines={1}>
            {getStartDateLabel(event.dateRange)}
          </Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => onPress(event.id)}
          hitSlop={4}
        >
          <Text style={styles.buttonText}>View Event</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      width: 175,
      backgroundColor: theme.palette.card,
      borderRadius: 24,
      borderWidth: 0.33,
      borderColor: theme.palette.cardBorder,
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 12,
      shadowColor: theme.palette.shadowColor,
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardPressed: {
      opacity: 0.8,
    },
    imageWrapper: {
      height: 140,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: theme.palette.cardBorder,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    content: {
      paddingTop: 16,
      gap: 16,
    },
    header: {
      gap: 4,
    },
    title: {
      ...subheadline.emphasized,
      color: theme.labelColors.primary,
    },
    date: {
      ...caption1.regular,
      color: theme.labelColors.secondary,
    },
    button: {
      height: 44,
      borderRadius: 999,
      backgroundColor: theme.palette.primaryButtonBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      ...subheadline.emphasized,
      color: theme.palette.primaryButtonText,
    },
  });
}

