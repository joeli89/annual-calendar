/**
 * Intent: Define the shared Event type for the Events UI.
 * Why: Keep data and components strongly typed and consistent.
 */
export type Event = {
  id: string;
  title: string;
  dateRange: string;
  location: string;
  description: string;
  mainImageUrl: string;
  sideImageUrls: [string, string];
  mapImageUrl: string;
  /** Month 1–12 for section grouping. */
  month: number;
  /** Year for section grouping. */
  year: number;
  /** Optional map coordinates from Supabase; used on detail screen when present. */
  latitude?: number;
  longitude?: number;
};
