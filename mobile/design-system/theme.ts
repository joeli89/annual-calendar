import { useMemo } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

import {
  backgrounds,
  grays,
  labelColors,
  labelColorsLight,
  separators,
  strokes,
  surfacesLight,
} from './colors';

const surfacesDark = {
  screen: backgrounds.primary,
  cardMuted: backgrounds.secondary,
  control: backgrounds.tertiary,
  placeholder: backgrounds.tertiary,
  frosted: 'rgba(28, 28, 30, 0.86)',
  dimmed: 'rgba(255, 255, 255, 0.3)',
} as const;

const paletteLight = {
  screen: surfacesLight.screen,
  card: grays.white,
  cardBorder: strokes.section,
  separator: labelColorsLight.quaternary,
  shadowColor: grays.black,
  control: surfacesLight.control,
  cardMuted: surfacesLight.cardMuted,
  placeholder: surfacesLight.placeholder,
  frostedSurface: surfacesLight.frostedWhite,
  primaryButtonBackground: grays.black,
  primaryButtonText: grays.white,
  pageDotActive: labelColorsLight.primary,
  pageDotInactive: surfacesLight.dimmedBlack,
  headerButtonFallback: '#404040',
} as const;

const paletteDark = {
  screen: surfacesDark.screen,
  card: backgrounds.secondary,
  cardBorder: separators.nonOpaque,
  separator: separators.nonOpaque,
  shadowColor: grays.black,
  control: surfacesDark.control,
  cardMuted: surfacesDark.cardMuted,
  placeholder: surfacesDark.placeholder,
  frostedSurface: surfacesDark.frosted,
  primaryButtonBackground: grays.white,
  primaryButtonText: grays.black,
  pageDotActive: labelColors.primary,
  pageDotInactive: surfacesDark.dimmed,
  headerButtonFallback: labelColors.primary,
} as const;

export function getAppTheme(colorScheme: ColorSchemeName) {
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    statusBarStyle: isDark ? 'light' : 'dark',
    labelColors: isDark ? labelColors : labelColorsLight,
    palette: isDark ? paletteDark : paletteLight,
  } as const;
}

export type AppTheme = ReturnType<typeof getAppTheme>;

export function useAppTheme() {
  const colorScheme = useColorScheme();

  return useMemo(() => getAppTheme(colorScheme), [colorScheme]);
}
