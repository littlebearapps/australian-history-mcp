/**
 * Historical Name Mappings
 *
 * Maps modern placenames to historical alternatives for search suggestions.
 * Does not auto-expand queries - provides suggestions only.
 * @module core/search/names
 */

// ============================================================================
// Types
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
// Historical Name Mappings
// ============================================================================

/**
 * Historical placename alternatives.
 * Modern name -> historical names used in archives.
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
