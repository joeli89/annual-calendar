/**
 * Intent: Multi-column wheel picker for the DOB and collection-size steps.
 * Why: Wraps @react-native-picker/picker — a native wheel on iOS and a
 * dropdown on Android. That platform difference is accepted; iOS is the
 * launch target and a JS wheel lib for parity is deliberately avoided.
 */
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { onboardingTokens as t } from './tokens';

export type WheelColumn = {
  key: string;
  items: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  /** Relative width of this column (default 1). */
  flex?: number;
};

type Props = {
  columns: WheelColumn[];
};

export function WheelPicker({ columns }: Props) {
  return (
    <View style={styles.container}>
      {columns.map((col) => (
        <Picker
          key={col.key}
          selectedValue={col.selectedValue}
          onValueChange={(value) => col.onValueChange(String(value))}
          style={[styles.picker, { flex: col.flex ?? 1 }]}
          itemStyle={styles.pickerItem}
        >
          {col.items.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
              color={t.label}
            />
          ))}
        </Picker>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: t.inputWidth,
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: 16,
    backgroundColor: Platform.OS === 'ios' ? t.secondaryFill : 'transparent',
    overflow: 'hidden',
  },
  picker: {
    ...(Platform.OS === 'android' ? { color: t.label } : {}),
  },
  pickerItem: {
    fontSize: 17,
    color: t.label,
  },
});
