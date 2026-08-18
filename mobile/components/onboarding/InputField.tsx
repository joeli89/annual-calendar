/**
 * Intent: Text input (345x64, secondary fill) for name/location steps.
 * Why: Uses BottomSheetTextInput so the sheet manages keyboard avoidance.
 */
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet } from 'react-native';

import { body } from '../../design-system';
import { onboardingTokens as t } from './tokens';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
};

export function InputField({
  value,
  onChangeText,
  placeholder,
  maxLength,
  autoFocus,
  onSubmitEditing,
}: Props) {
  return (
    <BottomSheetTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={t.secondaryLabel}
      maxLength={maxLength}
      autoFocus={autoFocus}
      autoCorrect={false}
      returnKeyType="done"
      onSubmitEditing={onSubmitEditing}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...body.regular,
    width: t.inputWidth,
    maxWidth: '100%',
    height: t.inputHeight,
    alignSelf: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    backgroundColor: t.secondaryFill,
    color: t.label,
  },
});
