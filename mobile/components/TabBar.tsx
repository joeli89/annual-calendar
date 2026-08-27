/**
 * Intent: Centralize native tab bar configuration for the app.
 * Why: Keep layout declarative and reuse tab structure in one place.
 *
 * Use the exported Label and Icon from the package so the layout context
 * recognizes them (child.type === Label) and sets options.title / options.icon.
 * Otherwise the native bar falls back to the route name (lowercase) and no icon.
 */
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { useAppTheme } from '../design-system';

export function TabBar() {
  const theme = useAppTheme();
  return (
    // Theme-aware tint: a hardcoded black active tab disappears against the
    // dark-mode glass bar.
    <NativeTabs tintColor={theme.isDark ? 'white' : 'black'}>
      <NativeTabs.Trigger name="events">
        <Icon sf={{ default: 'calendar', selected: 'calendar' }} />
        <Label>Events</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="saved">
        <Icon sf={{ default: 'heart', selected: 'heart.fill' }} />
        <Label>Saved</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Icon sf={{ default: 'magnifyingglass', selected: 'magnifyingglass' }} />
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
