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

  // --- Extended fields used by the event detail screen ---
  /** Full ordered image list (hero first) for the detail carousel. */
  imageUrls?: string[];
  /** Formatted full address for the Location section. */
  address?: string;
  /** Host/organizer name, e.g. "Watches & Wonders Geneva". */
  hostName?: string | null;
  /** Host/organizer logo or avatar URL. */
  hostLogoUrl?: string | null;
  /** Event visibility. */
  visibility?: 'public' | 'private';
  /** Access type. */
  accessType?: 'free' | 'paid';
  /** Primary event/website URL. */
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  xUrl?: string | null;
  /** ISO timestamps for start/end. */
  startAt?: string;
  endAt?: string;
  isAllDay?: boolean;
  /** Free-text exhibitor/maison brand names shown in the Exhibiting Brands section. */
  exhibitingBrands?: string[];
};
