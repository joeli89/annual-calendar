/**
 * Text styles from iOS 26 / iPadOS 26 (Figma).
 * Source: iOS-and-iPadOS-26--Community- — Text styles section.
 * SF Pro family; values match Figma variable definitions (size, lineHeight, letterSpacing, weight).
 */
import { TextStyle } from 'react-native';

type TextStyleSet = {
  regular: TextStyle;
  emphasized?: TextStyle;
  italic?: TextStyle;
  emphasizedItalic?: TextStyle;
};

function makeStyle(
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
  fontWeight: TextStyle['fontWeight'] = '400',
  fontStyle: TextStyle['fontStyle'] = 'normal'
): TextStyle {
  return {
    fontSize,
    lineHeight,
    letterSpacing,
    fontWeight,
    fontStyle,
  };
}

/** Large Title — 34pt */
export const largeTitle: TextStyleSet = {
  regular: makeStyle(34, 41, 0.4, '400'),
  emphasized: makeStyle(34, 41, 0.4, '700'),
};

/** Title 1 — 28pt */
export const title1: TextStyleSet = {
  regular: makeStyle(28, 34, 0.38, '400'),
  emphasized: makeStyle(28, 34, 0.38, '700'),
};

/** Title 2 — 22pt */
export const title2: TextStyleSet = {
  regular: makeStyle(22, 28, -0.26, '400'),
  emphasized: makeStyle(22, 28, -0.26, '700'),
};

/** Title 3 — 20pt */
export const title3: TextStyleSet = {
  regular: makeStyle(20, 25, -0.45, '400'),
  emphasized: makeStyle(20, 25, -0.45, '600'),
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
