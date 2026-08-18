/**
 * Intent: The Annual Calendar "AC" monogram, rendered from the real logo asset.
 * Why: Replaces the hand-drawn placeholder (bordered box + Playfair "AC") that
 * stood in while no transparent asset existed. assets/ac-logo.png ships at
 * 1x/2x/3x with a transparent background, so it stays crisp at any size.
 *
 * The artwork is a monochrome silhouette, so a single asset serves every
 * context via `tintColor` — no separate light/dark variants needed.
 * assets/ac-logo.svg is the vector source of truth (do not import it directly;
 * react-native-svg is not a dependency).
 */
import React from 'react';
import { Image, StyleSheet } from 'react-native';

/** Intrinsic aspect ratio of the monogram (289 x 415 in the source SVG). */
const ASPECT_RATIO = 289 / 415;

type Props = {
  /** Rendered height in px; width is derived from the artwork's aspect ratio. */
  height: number;
  /** Ink colour. Defaults to black to match the light onboarding sheet. */
  color?: string;
};

export function AcLogo({ height, color = '#000000' }: Props) {
  return (
    <Image
      source={require('../assets/ac-logo.png')}
      accessibilityRole="image"
      accessibilityLabel="Annual Calendar"
      resizeMode="contain"
      style={[styles.logo, { height, width: height * ASPECT_RATIO, tintColor: color }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // tintColor + contain handle sizing; nothing else to set.
  },
});
