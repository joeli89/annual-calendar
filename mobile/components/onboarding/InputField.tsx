/**
 * Intent: Text input (345x64, secondary fill) for name/location steps.
 * Why: Uses BottomSheetTextInput inside the onboarding sheet so the sheet
 * manages keyboard avoidance; a plain TextInput elsewhere (the Account edit
 * screens), because BottomSheetTextInput throws outside a BottomSheet.
 */
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { body } from '../../design-system';
import { onboardingTokens as t } from './tokens';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  /** True when rendered outside the onboarding bottom sheet. */
  standalone?: boolean;
};

export function InputField({
  value,
  onChangeText,
  placeholder,
  maxLength,
  autoFocus,
  onSubmitEditing,
  standalone,
}: Props) {
  const InputComponent = standalone ? TextInput : BottomSheetTextInput;
  return (
    <InputComponent
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
