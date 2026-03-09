/**
 * Intent: Render the event's start and end dates as a standalone summary card.
 * Why: Reuse across event detail and keep date parsing in one place.
 */
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  subheadline,
  title3,
  useAppTheme,
  type AppTheme,
} from '../design-system';

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

type EventDateCardProps = {
  dateRange: string;
};

export function EventDateCard({ dateRange }: EventDateCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    dateCard: {
      minHeight: 136,
      borderRadius: 28,
      backgroundColor: theme.palette.screen,
      paddingHorizontal: 28,
      paddingVertical: 24,
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    dateColumn: {
      flex: 1,
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
  });
}
