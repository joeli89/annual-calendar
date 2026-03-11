/** DB row shape from public.events (snake_case) for CMS. */
export type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  is_all_day: boolean;
  display_date_range: string;
  location_name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  hero_image_url: string;
  image_urls: string[];
  website_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type EventFormState = Omit<EventRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};
