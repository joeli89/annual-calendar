/**
 * Intent: Shared Events filter state (access type + country).
 * Why: The filter sheet is its own native formSheet route, so the Events list
 * and the sheet need one source of truth that survives navigation.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { Event } from '../types/event';

export type AccessFilter = 'all' | 'free' | 'paid';

/** Country for filtering; mock events only carry it in "City, Country". */
export function countryOf(event: Event): string | null {
  if (event.country?.trim()) return event.country.trim();
  const tail = event.location?.split(',').pop()?.trim();
  return tail || null;
}

type EventFiltersValue = {
  accessFilter: AccessFilter;
  countryFilter: string | null;
  /** Distinct countries in the loaded catalogue; set by the Events screen. */
  countryOptions: string[];
  hasActiveFilters: boolean;
  setAccessFilter: (value: AccessFilter) => void;
  setCountryFilter: (value: string | null) => void;
  setCountryOptions: (values: string[]) => void;
  clearFilters: () => void;
  /** Apply the current filters to a list of events. */
  applyFilters: (events: Event[]) => Event[];
};

const EventFiltersContext = createContext<EventFiltersValue | null>(null);

export function EventFiltersProvider({ children }: { children: React.ReactNode }) {
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [countryOptions, setCountryOptions] = useState<string[]>([]);

  const clearFilters = useCallback(() => {
    setAccessFilter('all');
    setCountryFilter(null);
  }, []);

  const applyFilters = useCallback(
    (events: Event[]) =>
      events.filter((event) => {
        if (accessFilter !== 'all' && (event.accessType ?? 'free') !== accessFilter) {
          return false;
        }
        if (countryFilter && countryOf(event) !== countryFilter) return false;
        return true;
      }),
    [accessFilter, countryFilter],
  );

  const value = useMemo(
    () => ({
      accessFilter,
      countryFilter,
      countryOptions,
      hasActiveFilters: accessFilter !== 'all' || countryFilter !== null,
      setAccessFilter,
      setCountryFilter,
      setCountryOptions,
      clearFilters,
      applyFilters,
    }),
    [accessFilter, countryFilter, countryOptions, clearFilters, applyFilters],
  );

  return (
    <EventFiltersContext.Provider value={value}>
      {children}
    </EventFiltersContext.Provider>
  );
}

export function useEventFilters(): EventFiltersValue {
  const value = useContext(EventFiltersContext);
  if (!value) {
    throw new Error('useEventFilters must be used within EventFiltersProvider');
  }
  return value;
}
