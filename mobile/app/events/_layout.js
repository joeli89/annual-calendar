/**
 * Intent: Nest a native Stack so the events tab gets a native (iOS 26 liquid glass) header.
 * Why: Native tabs don't provide a header; nesting Stack enables headers and push navigation.
 */
import { Stack } from 'expo-router';

export default function EventsLayout() {
  return <Stack />;
}
