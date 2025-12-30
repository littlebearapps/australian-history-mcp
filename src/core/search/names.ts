/**
 * Historical Name Mappings
 *
 * Maps modern placenames to historical alternatives for search suggestions.
 * Enhanced with GHAP integration for place names and curated data for organisations.
 * Does not auto-expand queries - provides suggestions only.
 * @module core/search/names
 */

import { ghapClient } from '../../sources/ghap/client.js';

// ============================================================================
// Types - Original (backward compatibility)
// ============================================================================

export interface NameSuggestion {
  /** Modern name found in query */
  modern: string;
  /** Historical alternatives */
  historical: string[];
  /** Suggestion text for user */
  suggestion: string;
}

// ============================================================================
// Types - Enhanced (Phase 1 Research Planning)
// ============================================================================

/** Entity type for name lookups */
export type EntityNameType = 'place' | 'organisation' | 'person';

/** Historical name with period and context */
export interface HistoricalNameInfo {
  /** Historical name variant */
  name: string;
  /** Time period when this name was used */
  period: { from: number; to: number };
  /** Context explaining why/when this name was used */
  context: string;
}

/** Enhanced name suggestions with metadata */
export interface NameSuggestions {
  /** Canonical/modern name */
  canonical: string;
  /** Historical name variants with periods */
  historicalNames: HistoricalNameInfo[];
  /** Alternative spellings (e.g., colour/color) */
  alternativeSpellings: string[];
  /** All terms to use in searches */
  searchTerms: string[];
  /** Data source for these suggestions */
  source: 'ghap' | 'curated' | 'both';
}

// ============================================================================
// Historical Name Mappings
// ============================================================================

/**
 * Historical placename alternatives.
 * Modern name -> historical names used in archives.
 * Note: For comprehensive place name lookups, use GHAP integration.
 */
const HISTORICAL_NAMES: Record<string, string[]> = {
  // Major cities
  melbourne: ['port phillip', 'batmania'],
  tasmania: ['van diemens land', "van diemen's land"],
  brisbane: ['moreton bay', 'queensland settlement'],
  darwin: ['palmerston', 'port darwin'],
  'alice springs': ['stuart'],
  hobart: ['hobart town', 'sullivans cove'],
  perth: ['swan river colony'],
  adelaide: ['province of south australia'],

  // Victorian places
  geelong: ['corio bay'],
  ballarat: ['ballaarat', 'yuille'],
  bendigo: ['sandhurst'],
  castlemaine: ['forest creek'],
  'st kilda': ['saint kilda'],
  fitzroy: ['newtown'],
  collingwood: ['collingwood flat'],
  'port melbourne': ['sandridge'],
  williamstown: ['point gellibrand'],

  // Historical regions
  'gold fields': ['gold diggings', 'goldfields'],
  'western district': ['australia felix'],

  // Rivers and geographic features
  'yarra river': ['yarra yarra', 'birrarung'],
  'murray river': ['hume river'],
};

/**
 * Era-specific name variations.
 * Some names changed at specific dates.
 */
const ERA_NAMES: Record<string, { name: string; from: number; to: number }[]> = {
  tasmania: [
    { name: 'van diemens land', from: 1642, to: 1856 },
    { name: 'tasmania', from: 1856, to: 2100 },
  ],
  darwin: [
    { name: 'palmerston', from: 1869, to: 1911 },
    { name: 'darwin', from: 1911, to: 2100 },
  ],
  bendigo: [
    { name: 'sandhurst', from: 1851, to: 1891 },
    { name: 'bendigo', from: 1891, to: 2100 },
  ],
};

/**
 * VFL/AFL club historical names.
 * Current name -> historical names with periods.
 * Stable data - club names rarely change.
 */
const VFL_CLUB_NAMES: Record<string, HistoricalNameInfo[]> = {
  'north melbourne': [
    { name: 'north melbourne', period: { from: 1869, to: 1998 }, context: 'Original VFL/AFL name' },
    { name: 'kangaroos', period: { from: 1999, to: 2007 }, context: 'Rebranded as Kangaroos' },
    { name: 'north melbourne', period: { from: 2008, to: 2100 }, context: 'Returned to North Melbourne' },
  ],
  'footscray': [
    { name: 'footscray', period: { from: 1925, to: 1996 }, context: 'Original VFL name' },
    { name: 'western bulldogs', period: { from: 1997, to: 2100 }, context: 'Rebranded for AFL expansion' },
  ],
  'western bulldogs': [
    { name: 'footscray', period: { from: 1925, to: 1996 }, context: 'Original VFL name' },
    { name: 'western bulldogs', period: { from: 1997, to: 2100 }, context: 'Current name' },
  ],
  'south melbourne': [
    { name: 'south melbourne', period: { from: 1897, to: 1981 }, context: 'Original VFL name' },
    { name: 'sydney swans', period: { from: 1982, to: 2100 }, context: 'Relocated to Sydney' },
  ],
  'sydney swans': [
    { name: 'south melbourne', period: { from: 1897, to: 1981 }, context: 'Original VFL name' },
    { name: 'sydney swans', period: { from: 1982, to: 2100 }, context: 'Current name' },
  ],
  'fitzroy': [
    { name: 'fitzroy', period: { from: 1897, to: 1996 }, context: 'Original VFL name' },
    { name: 'brisbane lions', period: { from: 1997, to: 2100 }, context: 'Merged with Brisbane Bears' },
  ],
  'brisbane bears': [
    { name: 'brisbane bears', period: { from: 1987, to: 1996 }, context: 'AFL expansion team' },
    { name: 'brisbane lions', period: { from: 1997, to: 2100 }, context: 'Merged with Fitzroy' },
  ],
  'brisbane lions': [
    { name: 'fitzroy', period: { from: 1897, to: 1996 }, context: 'Fitzroy FC predecessor' },
    { name: 'brisbane bears', period: { from: 1987, to: 1996 }, context: 'Brisbane Bears predecessor' },
    { name: 'brisbane lions', period: { from: 1997, to: 2100 }, context: 'Merged club' },
  ],
};

/**
 * Alternative spellings for common terms.
 * British/Australian vs American spelling, common variations.
 */
const ALTERNATIVE_SPELLINGS: Record<string, string[]> = {
  // British/Australian vs American
  colour: ['color'],
  colour_s: ['colors'],
  harbour: ['harbor'],
  labour: ['labor'],
  centre: ['center'],
  defence: ['defense'],
  licence: ['license'],
  organisation: ['organization'],
  realise: ['realize'],
  analyse: ['analyze'],
  travelled: ['traveled'],
  programme: ['program'],
  grey: ['gray'],
  gaol: ['jail'],
  // Historical spellings
  waggon: ['wagon'],
  connexion: ['connection'],
  shew: ['show'],
  despatch: ['dispatch'],
  // Common place name variations
  'st kilda': ['st. kilda', 'saint kilda'],
  'st arnaud': ['st. arnaud', 'saint arnaud'],
  'mt gambier': ['mt. gambier', 'mount gambier'],
  'mt isa': ['mt. isa', 'mount isa'],
};

// ============================================================================
// Functions
// ============================================================================

/**
 * Find historical name suggestions for a query.
 *
 * @param query - Search query string
 * @returns Array of name suggestions
 */
export function findNameSuggestions(query: string): NameSuggestion[] {
  const queryLower = query.toLowerCase();
  const suggestions: NameSuggestion[] = [];

  for (const [modern, historical] of Object.entries(HISTORICAL_NAMES)) {
    if (queryLower.includes(modern)) {
      suggestions.push({
        modern,
        historical,
        suggestion: `For older records, try: ${historical.map((h) => `"${h}"`).join(' or ')}`,
      });
    }
  }

  return suggestions;
}

/**
 * Get the appropriate historical name for a year.
 *
 * @param modern - Modern placename
 * @param year - Target year
 * @returns Historical name for that era, or modern name
 */
export function getHistoricalName(modern: string, year: number): string {
  const modernLower = modern.toLowerCase();
  const eraNames = ERA_NAMES[modernLower];

  if (eraNames) {
    for (const era of eraNames) {
      if (year >= era.from && year <= era.to) {
        return era.name;
      }
    }
  }

  // Fallback to first historical name if before any era
  const historical = HISTORICAL_NAMES[modernLower];
  if (historical && historical.length > 0) {
    return historical[0];
  }

  return modern;
}

/**
 * Get all known historical names for a place.
 *
 * @param modern - Modern placename
 * @returns All historical alternatives
 */
export function getHistoricalNames(modern: string): string[] {
  return HISTORICAL_NAMES[modern.toLowerCase()] ?? [];
}

/**
 * Check if a query contains any mappable modern names.
 *
 * @param query - Search query string
 * @returns true if suggestions available
 */
export function hasNameSuggestions(query: string): boolean {
  const queryLower = query.toLowerCase();
  return Object.keys(HISTORICAL_NAMES).some((name) => queryLower.includes(name));
}

// ============================================================================
// Enhanced Functions (Phase 1 Research Planning)
// ============================================================================

/**
 * Query GHAP for historical name variants of a place.
 * Uses fuzzy search to find potential matches.
 *
 * @param name - Place name to look up
 * @returns Historical name variants from GHAP
 */
export async function getHistoricalNamesFromGHAP(name: string): Promise<HistoricalNameInfo[]> {
  try {
    const result = await ghapClient.search({
      fuzzyname: name,
      limit: 10,
    });

    if (!result.places || result.places.length === 0) {
      return [];
    }

    // Extract unique names with their date ranges
    const nameMap = new Map<string, HistoricalNameInfo>();

    for (const place of result.places) {
      const placeName = place.name.toLowerCase();
      if (placeName === name.toLowerCase()) continue; // Skip exact match

      // Parse date range if available
      let from = 1788; // Default to European settlement
      let to = 2100;
      if (place.dateRange) {
        const match = place.dateRange.match(/(\d{4})/g);
        if (match) {
          from = parseInt(match[0], 10);
          if (match.length > 1) {
            to = parseInt(match[1], 10);
          }
        }
      }

      if (!nameMap.has(placeName)) {
        nameMap.set(placeName, {
          name: place.name,
          period: { from, to },
          context: place.source ?? 'GHAP historical placename',
        });
      }
    }

    return Array.from(nameMap.values());
  } catch {
    // GHAP unavailable - return empty array
    return [];
  }
}

/**
 * Get comprehensive historical name information for an entity.
 * Combines GHAP lookup (for places) with curated data (for organisations).
 *
 * @param name - Entity name to look up
 * @param type - Type of entity (place, organisation, person)
 * @param dateRange - Optional date range to filter by
 * @returns Complete name suggestions with all variants
 */
export async function getHistoricalNameInfo(
  name: string,
  type: EntityNameType,
  dateRange?: { from?: number; to?: number }
): Promise<NameSuggestions> {
  const nameLower = name.toLowerCase();
  const historicalNames: HistoricalNameInfo[] = [];
  const alternativeSpellings: string[] = [];
  let source: 'ghap' | 'curated' | 'both' = 'curated';

  // Check curated data first
  if (type === 'organisation') {
    // VFL/AFL clubs
    const clubNames = VFL_CLUB_NAMES[nameLower];
    if (clubNames) {
      historicalNames.push(...clubNames);
    }
  } else if (type === 'place') {
    // Curated place names
    const curatedHistorical = HISTORICAL_NAMES[nameLower];
    if (curatedHistorical) {
      const eraNames = ERA_NAMES[nameLower];
      if (eraNames) {
        historicalNames.push(
          ...eraNames.map((e) => ({
            name: e.name,
            period: { from: e.from, to: e.to },
            context: 'Era-specific name',
          }))
        );
      } else {
        // No era data - use generic period
        historicalNames.push(
          ...curatedHistorical.map((h) => ({
            name: h,
            period: { from: 1788, to: 2100 },
            context: 'Historical alternative',
          }))
        );
      }
    }

    // Query GHAP for additional variants
    const ghapNames = await getHistoricalNamesFromGHAP(name);
    if (ghapNames.length > 0) {
      // Merge GHAP results (avoiding duplicates)
      const existingNames = new Set(historicalNames.map((h) => h.name.toLowerCase()));
      for (const ghapName of ghapNames) {
        if (!existingNames.has(ghapName.name.toLowerCase())) {
          historicalNames.push(ghapName);
          existingNames.add(ghapName.name.toLowerCase());
        }
      }
      source = historicalNames.length > ghapNames.length ? 'both' : 'ghap';
    }
  }

  // Check alternative spellings
  const spellings = ALTERNATIVE_SPELLINGS[nameLower];
  if (spellings) {
    alternativeSpellings.push(...spellings);
  }

  // Also check if the name contains words with alternative spellings
  for (const [word, alts] of Object.entries(ALTERNATIVE_SPELLINGS)) {
    if (nameLower.includes(word) && word !== nameLower) {
      for (const alt of alts) {
        alternativeSpellings.push(nameLower.replace(word, alt));
      }
    }
  }

  // Filter by date range if provided
  let filteredHistorical = historicalNames;
  if (dateRange?.from || dateRange?.to) {
    const from = dateRange.from ?? 1788;
    const to = dateRange.to ?? 2100;
    filteredHistorical = historicalNames.filter(
      (h) => h.period.from <= to && h.period.to >= from
    );
  }

  // Generate all search terms
  const searchTerms = generateSearchTerms({
    canonical: name,
    historicalNames: filteredHistorical,
    alternativeSpellings,
    searchTerms: [],
    source,
  });

  return {
    canonical: name,
    historicalNames: filteredHistorical,
    alternativeSpellings,
    searchTerms,
    source,
  };
}

/**
 * Generate all search terms from name suggestions.
 * Combines canonical name, historical variants, and alternative spellings.
 *
 * @param suggestions - Name suggestions object
 * @returns Array of all terms to use in searches
 */
export function generateSearchTerms(suggestions: NameSuggestions): string[] {
  const terms = new Set<string>();

  // Add canonical name
  terms.add(suggestions.canonical);
  terms.add(suggestions.canonical.toLowerCase());

  // Add historical names
  for (const historical of suggestions.historicalNames) {
    terms.add(historical.name);
    terms.add(historical.name.toLowerCase());
  }

  // Add alternative spellings
  for (const spelling of suggestions.alternativeSpellings) {
    terms.add(spelling);
    terms.add(spelling.toLowerCase());
  }

  return Array.from(terms);
}
