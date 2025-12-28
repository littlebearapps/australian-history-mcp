/**
 * Source Router for Federated Search
 *
 * Maps queries and content types to relevant sources.
 * Handles parameter translation between common search args and source-specific APIs.
 * Integrates query builders for sources that support advanced syntax (Trove, PROV, ALA).
 */

import { getBuilder, hasBuilder } from './query/index.js';
import type { ParsedQuery } from './query/types.js';

// ============================================================================
// Types
// ============================================================================

export interface SourceRoute {
  /** Source identifier (e.g., 'prov') */
  source: string;
  /** Tool name for search (e.g., 'prov_search') */
  tool: string;
  /** Keywords that trigger this source in auto-select */
  keywords: string[];
  /** Content types this source handles */
  types: ContentType[];
}

export type ContentType = 'image' | 'newspaper' | 'document' | 'species' | 'heritage' | 'film';

export interface CommonSearchArgs {
  query: string;
  dateFrom?: string;
  dateTo?: string;
  state?: string;
  limit?: number;
  [key: string]: unknown;
}

// ============================================================================
// Source Display Names
// ============================================================================

export const SOURCE_DISPLAY: Record<string, string> = {
  prov: 'Public Record Office Victoria',
  trove: 'Trove (National Library)',
  museumsvic: 'Museums Victoria',
  ala: 'Atlas of Living Australia',
  nma: 'National Museum of Australia',
  vhd: 'Victorian Heritage Database',
  acmi: 'Australian Centre for the Moving Image',
  ghap: 'Gazetteer of Historical Australian Placenames',
  'ga-hap': 'Geoscience Australia Historical Aerial Photography',
};

// ============================================================================
// Source Routes
// ============================================================================

/**
 * Routes for all searchable sources.
 * PM Transcripts and IIIF excluded (no search capability).
 */
export const SOURCE_ROUTES: SourceRoute[] = [
  {
    source: 'prov',
    tool: 'prov_search',
    keywords: ['victoria', 'archives', 'government', 'council', 'state', 'colonial', 'records'],
    types: ['image', 'document'],
  },
  {
    source: 'trove',
    tool: 'trove_search',
    keywords: ['newspaper', 'article', 'gazette', 'book', 'national', 'library', 'magazine'],
    types: ['newspaper', 'image', 'document'],
  },
  {
    source: 'museumsvic',
    tool: 'museumsvic_search',
    keywords: ['museum', 'specimen', 'artefact', 'natural', 'history', 'collection'],
    types: ['image', 'document'],
  },
  {
    source: 'ala',
    tool: 'ala_search_occurrences',
    keywords: ['species', 'wildlife', 'animal', 'plant', 'biodiversity', 'fauna', 'flora'],
    types: ['species'],
  },
  {
    source: 'nma',
    tool: 'nma_search_objects',
    keywords: ['museum', 'national', 'artefact', 'indigenous', 'aboriginal', 'collection'],
    types: ['image', 'document'],
  },
  {
    source: 'vhd',
    tool: 'vhd_search_places',
    keywords: ['heritage', 'building', 'architecture', 'historic', 'site', 'listed'],
    types: ['heritage'],
  },
  {
    source: 'acmi',
    tool: 'acmi_search_works',
    keywords: ['film', 'movie', 'television', 'tv', 'videogame', 'digital', 'cinema'],
    types: ['film'],
  },
  {
    source: 'ghap',
    tool: 'ghap_search',
    keywords: ['placename', 'location', 'historical', 'coordinates', 'geography', 'map'],
    types: ['document'],
  },
  {
    source: 'ga-hap',
    tool: 'ga_hap_search',
    keywords: ['aerial', 'photograph', 'geoscience', 'aviation', 'survey', 'overhead'],
    types: ['image'],
  },
];

// ============================================================================
// Source Selection
// ============================================================================

/**
 * Select sources based on explicit list, content type, or query keyword matching.
 *
 * Priority:
 * 1. Explicit sources (if provided)
 * 2. Content type filter
 * 3. Query keyword matching
 * 4. Default to all image/document sources
 */
export function selectSources(
  query: string,
  type?: ContentType,
  explicitSources?: string[]
): SourceRoute[] {
  // 1. Explicit sources provided
  if (explicitSources && explicitSources.length > 0) {
    const validSources = explicitSources
      .map((s) => SOURCE_ROUTES.find((r) => r.source === s))
      .filter((r): r is SourceRoute => r !== undefined);

    if (validSources.length > 0) {
      return validSources;
    }
    // Fall through if no valid sources
  }

  // 2. Filter by content type
  let candidates = [...SOURCE_ROUTES];
  if (type) {
    candidates = candidates.filter((r) => r.types.includes(type));
  }

  // 3. Score by keyword matches
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  const scored = candidates.map((route) => {
    let score = 0;
    for (const keyword of route.keywords) {
      if (queryLower.includes(keyword)) {
        score += 2; // Substring match
      }
      if (queryWords.includes(keyword)) {
        score += 3; // Exact word match
      }
    }
    return { route, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // 4. Return matching sources (score > 0), or default to top sources for broad searches
  const matching = scored.filter((s) => s.score > 0);

  if (matching.length > 0) {
    // Return up to 5 matching sources
    return matching.slice(0, 5).map((s) => s.route);
  }

  // Default: return broad sources for general queries (PROV, Trove, NMA, Museums Vic)
  return ['prov', 'trove', 'nma', 'museumsvic']
    .map((s) => SOURCE_ROUTES.find((r) => r.source === s))
    .filter((r): r is SourceRoute => r !== undefined);
}

// ============================================================================
// Parameter Mapping
// ============================================================================

/**
 * Map common search arguments to source-specific parameters.
 *
 * Each source has different parameter names:
 * - dateFrom/dateTo: PROV, Trove use as-is; GA HAP uses yearFrom/yearTo; ALA uses startYear/endYear
 * - state: Trove, GA HAP, GHAP support; VHD is Victoria-only
 * - limit: Most use limit; ACMI uses page (1-based)
 *
 * When `parsed` is provided, uses query builders for sources that support them.
 */
export function mapArgsToSource(
  source: string,
  args: CommonSearchArgs,
  parsed?: ParsedQuery
): Record<string, unknown> {
  let { query, dateFrom, dateTo, state, limit = 10 } = args;

  // Apply query builders for sources that support them
  if (parsed && hasBuilder(source)) {
    const builder = getBuilder(source)!;
    const transformed = builder.build(parsed, args);
    query = transformed.transformed;
    // Use applied date range from builder if not explicitly set
    if (!dateFrom && transformed.appliedDateRange?.from && transformed.appliedDateRange.from !== '*') {
      dateFrom = transformed.appliedDateRange.from;
    }
    if (!dateTo && transformed.appliedDateRange?.to && transformed.appliedDateRange.to !== '*') {
      dateTo = transformed.appliedDateRange.to;
    }
  }
  const mapped: Record<string, unknown> = {};

  switch (source) {
    case 'prov':
      mapped.query = query;
      if (dateFrom) mapped.dateFrom = dateFrom;
      if (dateTo) mapped.dateTo = dateTo;
      mapped.limit = limit;
      mapped.digitisedOnly = true; // Default to digitised for federated search
      break;

    case 'trove':
      mapped.query = query;
      if (dateFrom) mapped.dateFrom = dateFrom;
      if (dateTo) mapped.dateTo = dateTo;
      if (state) mapped.state = state.toLowerCase();
      mapped.limit = limit;
      break;

    case 'museumsvic':
      mapped.query = query;
      mapped.limit = limit;
      mapped.hasImages = true; // Prefer records with images
      break;

    case 'ala':
      mapped.query = query;
      if (dateFrom) mapped.startYear = parseInt(dateFrom, 10);
      if (dateTo) mapped.endYear = parseInt(dateTo, 10);
      if (state) mapped.stateProvince = mapStateToFull(state);
      mapped.limit = limit;
      mapped.hasImages = true;
      break;

    case 'nma':
      mapped.query = query;
      mapped.limit = limit;
      break;

    case 'vhd':
      mapped.query = query;
      mapped.limit = limit;
      // VHD is Victoria-only, no state param needed
      break;

    case 'acmi':
      mapped.query = query;
      if (dateFrom) mapped.year = parseInt(dateFrom, 10);
      mapped.page = 1; // ACMI uses page-based pagination
      // Note: ACMI limit is handled differently (size param in schema)
      break;

    case 'ghap':
      mapped.query = query;
      if (state) mapped.state = state.toUpperCase();
      mapped.limit = limit;
      break;

    case 'ga-hap':
      // GA HAP doesn't use query - uses bbox/state/year
      if (dateFrom) mapped.yearFrom = parseInt(dateFrom, 10);
      if (dateTo) mapped.yearTo = parseInt(dateTo, 10);
      if (state) mapped.state = state.toUpperCase();
      mapped.limit = limit;
      mapped.scannedOnly = true; // Only return scanned photos
      break;

    default:
      // Fallback: pass common args as-is
      mapped.query = query;
      if (dateFrom) mapped.dateFrom = dateFrom;
      if (dateTo) mapped.dateTo = dateTo;
      if (state) mapped.state = state;
      mapped.limit = limit;
  }

  return mapped;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Map state abbreviation to full name (for ALA stateProvince parameter).
 */
function mapStateToFull(state: string): string {
  const mapping: Record<string, string> = {
    vic: 'Victoria',
    nsw: 'New South Wales',
    qld: 'Queensland',
    sa: 'South Australia',
    wa: 'Western Australia',
    tas: 'Tasmania',
    nt: 'Northern Territory',
    act: 'Australian Capital Territory',
  };
  return mapping[state.toLowerCase()] ?? state;
}

/**
 * Get all valid source names.
 */
export function getValidSources(): string[] {
  return SOURCE_ROUTES.map((r) => r.source);
}

/**
 * Check if a source name is valid.
 */
export function isValidSource(source: string): boolean {
  return SOURCE_ROUTES.some((r) => r.source === source);
}
