/**
 * Color tokens from iOS 26 / iPadOS 26 (Figma).
 * Source: iOS-and-iPadOS-26--Community- — Default (node 5707-28659).
 */

/** Background fills (dark theme) */
export const backgrounds = {
  primary: '#000000',
  secondary: '#1c1c1e',
  tertiary: '#2c2c2e',
  primaryElevated: '#1c1c1e',
  secondaryElevated: '#2c2c2e',
  tertiaryElevated: '#3a3a3c',
} as const;

/** Label text on dark backgrounds */
export const labelColors = {
  primary: '#ffffff',
  secondary: '#ebebf599', // 60% opacity
  tertiary: '#ebebf54d', // 30% opacity
  quaternary: '#ebebf529', // ~16% opacity
} as const;

/** Label text on light backgrounds (from Text styles frame) */
export const labelColorsLight = {
  primary: '#000000',
  secondary: '#3c3c4399',
  tertiary: '#3C3C43',
  quaternary: '#3c3c432e',
} as const;

/** Separator strokes */
export const separators = {
  opaque: '#38383a',
  nonOpaque: '#ffffff2b',
} as const;

/** Gray scale */
export const grays = {
  black: '#000000',
  gray: '#8e8e93',
  gray2: '#AEAEB2',
  gray3: '#48484a',
  gray4: '#3a3a3c',
  gray5: '#2c2c2e',
  gray6: '#1c1c1e',
  white: '#ffffff',
} as const;

/** Semantic / accent colors */
export const colors = {
  red: '#ff4245',
  orange: '#ff9230',
  yellow: '#ffd600',
  mint: '#00dac3',
  teal: '#00d2e0',
  cyan: '#3cd3fe',
  blue: '#0091ff',
  indigo: '#6b5dff',
  purple: '#db34f2',
  pink: '#ff375f',
  brown: '#b78a66',
} as const;

/** Strokes */
export const strokes = {
  component: '#6155f5',
  section: '#00000066',
} as const;

/** Light-theme surface fills (screens, cards, controls) */
export const surfacesLight = {
  screen: '#f6f6f6',
  cardMuted: '#f2f2f2',
  control: '#f2f2f7',
  placeholder: '#d9d9d9',
  frostedWhite: 'rgba(255,255,255,0.86)',
  dimmedBlack: 'rgba(0, 0, 0, 0.3)',
} as const;

export type BackgroundKey = keyof typeof backgrounds;
export type LabelColorKey = keyof typeof labelColors;
export type LabelColorLightKey = keyof typeof labelColorsLight;
export type SeparatorKey = keyof typeof separators;
export type GrayKey = keyof typeof grays;
export type ColorKey = keyof typeof colors;
export type StrokeKey = keyof typeof strokes;
export type SurfaceLightKey = keyof typeof surfacesLight;
