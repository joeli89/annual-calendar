/**
 * Text styles from iOS 26 / iPadOS 26 (Figma).
 * Source: iOS-and-iPadOS-26--Community- — Text styles section.
 * Body/label styles use SF Pro (system); Title styles use Playfair Display.
 * Values match Figma variable definitions (size, lineHeight, letterSpacing, weight).
 */
import { TextStyle } from 'react-native';

type TextStyleSet = {
  regular: TextStyle;
  emphasized?: TextStyle;
  italic?: TextStyle;
  emphasizedItalic?: TextStyle;
};

/**
 * Playfair Display font-family names, registered in app/_layout.js via useFonts().
 * On iOS a per-weight family is used so the correct cut renders; fontWeight is
 * retained as an Android fallback.
 */
export const fontFamilies = {
  titleRegular: 'PlayfairDisplay-Regular',
  titleSemibold: 'PlayfairDisplay-SemiBold',
  titleBold: 'PlayfairDisplay-Bold',
} as const;

function makeStyle(
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
  fontWeight: TextStyle['fontWeight'] = '400',
  fontStyle: TextStyle['fontStyle'] = 'normal',
  fontFamily?: string
): TextStyle {
  return {
    fontSize,
    lineHeight,
    letterSpacing,
    fontWeight,
    fontStyle,
    ...(fontFamily ? { fontFamily } : null),
  };
}

/** Large Title — 34pt (Playfair Display) */
export const largeTitle: TextStyleSet = {
  regular: makeStyle(34, 41, 0.4, '400', 'normal', fontFamilies.titleRegular),
  emphasized: makeStyle(34, 41, 0.4, '700', 'normal', fontFamilies.titleBold),
};

/** Title 1 — 28pt (Playfair Display) */
export const title1: TextStyleSet = {
  regular: makeStyle(28, 34, 0.38, '400', 'normal', fontFamilies.titleRegular),
  emphasized: makeStyle(28, 34, 0.38, '700', 'normal', fontFamilies.titleBold),
};

/** Title 2 — 22pt (Playfair Display) */
export const title2: TextStyleSet = {
  regular: makeStyle(22, 28, -0.26, '400', 'normal', fontFamilies.titleRegular),
  emphasized: makeStyle(22, 28, -0.26, '700', 'normal', fontFamilies.titleBold),
};

/** Title 3 — 20pt (Playfair Display) */
export const title3: TextStyleSet = {
  regular: makeStyle(20, 25, -0.45, '400', 'normal', fontFamilies.titleRegular),
  emphasized: makeStyle(20, 25, -0.45, '600', 'normal', fontFamilies.titleSemibold),
};

/** Headline — 17pt Semibold */
export const headline: TextStyleSet = {
  regular: makeStyle(17, 22, -0.43, '600'),
  italic: makeStyle(17, 22, -0.43, '600', 'italic'),
};

/** Body — 17pt */
export const body: TextStyleSet = {
  regular: makeStyle(17, 22, -0.43, '400'),
  emphasized: makeStyle(17, 22, -0.43, '600'),
  italic: makeStyle(17, 22, -0.43, '400', 'italic'),
  emphasizedItalic: makeStyle(17, 22, -0.43, '600', 'italic'),
};

/** Callout — 16pt */
export const callout: TextStyleSet = {
  regular: makeStyle(16, 21, -0.31, '400'),
  emphasized: makeStyle(16, 21, -0.31, '600'),
  italic: makeStyle(16, 21, -0.31, '400', 'italic'),
  emphasizedItalic: makeStyle(16, 21, -0.31, '600', 'italic'),
};

/** Subheadline — 15pt */
export const subheadline: TextStyleSet = {
  regular: makeStyle(15, 20, -0.23, '400'),
  emphasized: makeStyle(15, 20, -0.23, '600'),
  italic: makeStyle(15, 20, -0.23, '400', 'italic'),
  emphasizedItalic: makeStyle(15, 20, -0.23, '600', 'italic'),
};

/** Footnote — 13pt */
export const footnote: TextStyleSet = {
  regular: makeStyle(13, 18, -0.08, '400'),
  emphasized: makeStyle(13, 18, -0.08, '600'),
  italic: makeStyle(13, 18, -0.08, '400', 'italic'),
  emphasizedItalic: makeStyle(13, 18, -0.08, '600', 'italic'),
};

/** Caption 1 — 12pt */
export const caption1: TextStyleSet = {
  regular: makeStyle(12, 16, 0, '400'),
  emphasized: makeStyle(12, 16, 0, '500'),
  italic: makeStyle(12, 16, 0, '400', 'italic'),
  emphasizedItalic: makeStyle(12, 16, 0, '500', 'italic'),
};

/** Caption 2 — 11pt */
export const caption2: TextStyleSet = {
  regular: makeStyle(11, 13, 0.06, '400'),
  emphasized: makeStyle(11, 13, 0.06, '600'),
  italic: makeStyle(11, 13, 0.06, '400', 'italic'),
  emphasizedItalic: makeStyle(11, 13, 0.06, '600', 'italic'),
};

/** All typography styles keyed by name (for programmatic use). */
export const textStyles = {
  largeTitle,
  title1,
  title2,
  title3,
  headline,
  body,
  callout,
  subheadline,
  footnote,
  caption1,
  caption2,
} as const;

export type TextStyleName = keyof typeof textStyles;
