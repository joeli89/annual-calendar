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
};
