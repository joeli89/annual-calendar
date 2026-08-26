/**
 * Intent: iOS-style grouped table view pieces for the Profile/Account screens.
 * Why: Both screens render the same Figma "Grouped Table View" component —
 * one implementation keeps rows, separators, and section labels identical.
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { body, footnote, useAppTheme, type AppTheme } from '../design-system';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function GroupedCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.card, style]}>
      {rows.map((row, index) => (
        <React.Fragment key={index}>
          {index > 0 ? <View style={styles.separator} /> : null}
          {row}
        </React.Fragment>
      ))}
    </View>
  );
}

export function GroupedRow({
  label,
  value,
  icon,
  showChevron = true,
  onPress,
}: {
  label: string;
  value?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  showChevron?: boolean;
  onPress?: () => void;
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const content = (
    <>
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={theme.labelColors.primary}
          style={styles.rowIcon}
        />
      ) : null}
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.labelColors.tertiary}
        />
      ) : null}
    </>
  );
  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {content}
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    sectionLabel: {
      ...footnote.regular,
      color: theme.labelColors.secondary,
      marginLeft: 16,
      marginBottom: 8,
    },
    card: {
      backgroundColor: theme.palette.card,
      borderRadius: 20,
      overflow: 'hidden',
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.palette.separator,
      marginLeft: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    rowPressed: {
      backgroundColor: theme.palette.cardMuted,
    },
    rowIcon: {
      marginRight: 4,
    },
    rowLabel: {
      ...body.regular,
      color: theme.labelColors.primary,
      flex: 1,
    },
    rowValue: {
      ...body.regular,
      color: theme.labelColors.secondary,
    },
  });
}
