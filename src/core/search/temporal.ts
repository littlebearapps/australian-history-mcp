/**
 * Temporal Analysis and Date-Aware Routing
 *
 * Extracts date/era information from queries and filters sources
 * based on their historical coverage.
 * @module core/search/temporal
 */

import type { DateRange } from '../query/types.js';

// ============================================================================
// Types
// ============================================================================

export interface SourceCoverage {
  /** Source identifier */
  source: string;
  /** Start year of coverage */
  fromYear: number;
  /** End year of coverage */
  toYear: number;
  /** Description of coverage */
  description: string;
}

export interface TemporalFilterResult {
  /** Sources that cover the date range */
  includedSources: string[];
  /** Sources excluded with reasons */
  excludedSources: Record<string, string>;
  /** Date range used for filtering */
  dateRange: DateRange;
}

// ============================================================================
// Source Coverage Matrix
// ============================================================================

/**
 * Historical date coverage for each source.
 * Used to exclude sources that don't cover the query's time period.
 */
export const SOURCE_COVERAGE: SourceCoverage[] = [
  {
    source: 'prov',
    fromYear: 1800,
    toYear: 2010,
    description: 'Victorian colonial to contemporary government records',
  },
  {
    source: 'trove',
    fromYear: 1800,
    toYear: 2024,
    description: 'Newspapers from 1800s, books and images from various eras',
  },
  {
    source: 'museumsvic',
    fromYear: 1850,
    toYear: 2024,
    description: 'Museum collections spanning Victoria\'s history',
  },
  {
    source: 'ala',
    fromYear: 1800,
    toYear: 2024,
    description: 'Historical specimens and contemporary observations',
  },
  {
    source: 'nma',
    fromYear: 1788,
    toYear: 2024,
    description: 'National collection from First Fleet to present',
  },
  {
    source: 'vhd',
    fromYear: 1835,
    toYear: 2024,
    description: 'Victorian heritage places from settlement onwards',
  },
  {
    source: 'acmi',
    fromYear: 1900,
    toYear: 2024,
    description: 'Film, TV, and digital media from early cinema',
  },
  {
    source: 'ghap',
    fromYear: 1788,
    toYear: 1970,
    description: 'Historical placenames from colonial records',
  },
  {
    source: 'ga-hap',
    fromYear: 1928,
    toYear: 1996,
    description: 'Aerial photography program dates',
  },
];

// ============================================================================
// Filtering
// ============================================================================

/**
 * Get coverage info for a source.
 */
export function getSourceCoverage(source: string): SourceCoverage | undefined {
  return SOURCE_COVERAGE.find((c) => c.source === source);
}

/**
 * Check if a source covers a given date range.
 *
 * @param source - Source identifier
 * @param fromYear - Start year (or undefined for open start)
 * @param toYear - End year (or undefined for open end)
 * @returns true if any overlap exists
 */
export function sourceCoversDates(
  source: string,
  fromYear?: number,
  toYear?: number
): boolean {
  const coverage = getSourceCoverage(source);
  if (!coverage) return true; // Unknown source, include by default

  // If no date constraint, include
  if (fromYear === undefined && toYear === undefined) return true;

  // Check for overlap
  const queryFrom = fromYear ?? coverage.fromYear;
  const queryTo = toYear ?? coverage.toYear;

  // Overlap exists if query range and coverage range intersect
  return queryTo >= coverage.fromYear && queryFrom <= coverage.toYear;
}

/**
 * Filter sources based on date coverage.
 *
 * @param sources - Source identifiers to filter
 * @param dateRange - Date range to filter by
 * @returns Filtered sources with exclusion reasons
 */
export function filterByDateCoverage(
  sources: string[],
  dateRange: DateRange
): TemporalFilterResult {
  const fromYear = dateRange.from !== '*' ? parseInt(dateRange.from, 10) : undefined;
  const toYear = dateRange.to !== '*' ? parseInt(dateRange.to, 10) : undefined;

  const includedSources: string[] = [];
  const excludedSources: Record<string, string> = {};

  for (const source of sources) {
    if (sourceCoversDates(source, fromYear, toYear)) {
      includedSources.push(source);
    } else {
      const coverage = getSourceCoverage(source);
      if (coverage) {
        excludedSources[source] = `Coverage ${coverage.fromYear}-${coverage.toYear} doesn't overlap with ${dateRange.from}-${dateRange.to}`;
      } else {
        excludedSources[source] = 'Unknown coverage';
      }
    }
  }

  return {
    includedSources,
    excludedSources,
    dateRange,
  };
}

/**
 * Parse a year from a date string.
 * Handles YYYY format.
 */
export function parseYear(dateStr: string): number | undefined {
  if (!dateStr || dateStr === '*') return undefined;
  const year = parseInt(dateStr, 10);
  return isNaN(year) ? undefined : year;
}
