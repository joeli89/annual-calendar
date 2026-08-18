/**
 * Intent: Onboarding-sheet design tokens (Figma section 72:1655 "Onboarding").
 * Why: The sheet is designed light-only (white surface regardless of app
 * theme). Values come from the design system where a token exists; the two
 * fills that have no design-system token yet are defined once here.
 */
import { grays, labelColorsLight } from '../../design-system';

export const onboardingTokens = {
  /** Sheet background */
  background: grays.white, // #ffffff
  /** Primary label */
  label: labelColorsLight.primary, // #000000
  /** Secondary label */
  secondaryLabel: labelColorsLight.secondary, // #3c3c4399
  /** Interactive (buttons) background — Figma "interactive bg", no DS token yet */
  interactiveBackground: '#0d0d0d',
  /** Interactive (buttons) label */
  interactiveLabel: grays.white, // #ffffff
  /** Secondary fill (inputs, pills, header buttons) — no DS token yet */
  secondaryFill: '#78788029',
  /** Figma component metrics */
  buttonWidth: 345,
  buttonHeight: 44,
  inputWidth: 345,
  inputHeight: 64,
} as const;
