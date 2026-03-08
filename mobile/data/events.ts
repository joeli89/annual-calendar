/**
 * Intent: Provide mock event data for the Events screen.
 * Why: Keep the screen component focused on rendering, not data definition.
 */
import { Event } from '../types/event';

export const events: Event[] = [
  {
    id: 'watches-wonders-2026',
    title: 'Watches & Wonders',
    dateRange: '24th to 26th February 2026',
    location: 'Geneva, Switzerland',
    description:
      'A focused showcase of new releases, private previews, and collector-led panels across the city.',
    mainImageUrl:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80',
    sideImageUrls: [
      'https://images.unsplash.com/photo-1506224774220-b8d888b4f5b1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=600&q=80',
    ],
    mapImageUrl:
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'dubai-watch-week-2026',
    title: 'Dubai Watch Week',
    dateRange: '10th to 14th March 2026',
    location: 'Dubai, UAE',
    description:
      'Hands-on workshops, heritage talks, and limited-edition previews set against a luxury desert backdrop.',
    mainImageUrl:
      'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80',
    sideImageUrls: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=600&q=80',
    ],
    mapImageUrl:
      'https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'windup-watch-fair-2026',
    title: 'Windup Watch Fair',
    dateRange: '3rd to 5th April 2026',
    location: 'New York, USA',
    description:
      'Independent makers, boutique brands, and hands-on try-ons in a relaxed, community-first setting.',
    mainImageUrl:
      'https://images.unsplash.com/photo-1470214304380-aadaedcfff02?auto=format&fit=crop&w=1200&q=80',
    sideImageUrls: [
      'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506224774220-b8d888b4f5b1?auto=format&fit=crop&w=600&q=80',
    ],
    mapImageUrl:
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=200&q=80',
  },
];
