/**
 * Intent: Show event location on a native map (Apple Maps on iOS, Google Maps on Android), Airbnb-style.
 * Why: Prefer native maps when available, but gracefully fall back to a Google Maps web embed (e.g. Expo Go).
 */
import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useAppTheme, type AppTheme } from '../design-system';

const MAP_HEIGHT = 240;
const DEFAULT_ZOOM = 15;

// Try to access expo-maps at runtime so builds without the native module (Expo Go, old dev clients) don't crash.
let AppleMapsModule: typeof import('expo-maps').AppleMaps | null = null;
let GoogleMapsModule: typeof import('expo-maps').GoogleMaps | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ExpoMaps = require('expo-maps') as typeof import('expo-maps');
  AppleMapsModule = ExpoMaps.AppleMaps;
  GoogleMapsModule = ExpoMaps.GoogleMaps;
} catch {
  AppleMapsModule = null;
  GoogleMapsModule = null;
}

export type EventMapProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  variant?: 'card' | 'fullscreen';
};

export function EventMap({
  latitude,
  longitude,
  zoom = DEFAULT_ZOOM,
  variant = 'card',
}: EventMapProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const cameraPosition = useMemo(
    () => ({
      coordinates: { latitude, longitude },
      zoom,
    }),
    [latitude, longitude, zoom]
  );

  const markers = useMemo(
    () => [{ id: 'event', coordinates: { latitude, longitude } }],
    [latitude, longitude]
  );

  const containerStyle =
    variant === 'fullscreen'
      ? styles.fullScreenContainer
      : styles.cardContainer;

  if (Platform.OS === 'ios' && AppleMapsModule) {
    const AppleView = AppleMapsModule.View;

    return (
      <View style={containerStyle}>
        <AppleView
          cameraPosition={cameraPosition}
          markers={markers}
          style={styles.map}
        />
      </View>
    );
  }

  if (Platform.OS === 'android' && GoogleMapsModule) {
    const GoogleView = GoogleMapsModule.View;

    return (
      <View style={containerStyle}>
        <GoogleView
          cameraPosition={cameraPosition}
          markers={markers}
          style={styles.map}
        />
      </View>
    );
  }

  // Fallback: Google Maps web embed (works in Expo Go or if the native module is missing).
  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
          }
          iframe {
            border: 0;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </body>
    </html>
  `;

  return (
    <View style={containerStyle}>
      <WebView
        originWhitelist={['*']}
        scrollEnabled={false}
        source={{ html: iframeHtml }}
        style={styles.webView}
      />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    cardContainer: {
      width: '100%',
      height: '100%',
    },
    fullScreenContainer: {
      flex: 1,
      borderRadius: 0,
      borderWidth: 0,
      backgroundColor: theme.palette.screen,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    webView: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.palette.placeholder,
    },
  });
}
