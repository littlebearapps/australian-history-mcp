/**
 * Source Router for Federated Search
 *
 * Maps queries and content types to relevant sources.
 * Handles parameter translation between common search args and source-specific APIs.
 * Integrates query builders for sources that support advanced syntax (Trove, PROV, ALA).
 */

import { getBuilder, hasBuilder } from './query/index.js';
import type { ParsedQuery } from './query/types.js';
import type { IntentAnalysis, EntityType } from './search/intent.js';
import { getExtendedCoverage } from './search/temporal.js';

// ============================================================================
// Types - Original (backward compatibility)
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
  // SEARCH-016: Spatial query support
  lat?: number;
  lon?: number;
  radiusKm?: number;
  [key: string]: unknown;
}

// ============================================================================
// Types - Enhanced (Phase 1 Research Planning)
// ============================================================================

/** Relevance level for source prioritisation */
export type RelevanceLevel = 'high' | 'medium' | 'low';

/** Individual prioritised source with reasoning */
export interface PrioritisedSource {
  /** Source identifier */
  source: string;
  /** Tool name for search */
  tool: string;
  /** Relevance level based on intent analysis */
  relevance: RelevanceLevel;
  /** Human-readable reason for this relevance */
  reason: string;
  /** Additional tools available for this source */
  suggestedTools: string[];
  /** Suggested filters based on intent */
  suggestedFilters: Record<string, unknown>;
  /** Relevance score (0-100) */
  score: number;
}

/** Excluded source with reason */
export interface ExcludedSource {
  /** Source identifier */
  source: string;
  /** Reason for exclusion */
  reason: string;
}

/** Complete source prioritisation result */
export interface SourcePrioritisation {
  /** Sources ordered by relevance */
  prioritised: PrioritisedSource[];
  /** Sources excluded from search */
  excluded: ExcludedSource[];
  /** Recommended execution order (source names) */
  searchOrder: string[];
}

/** Source relevance score with reasoning */
interface RelevanceScore {
  score: number;
  reason: string;
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
  let { query, dateFrom, dateTo } = args;
  const { state, limit = 10 } = args;

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
      // Pass through ALA-specific filters (SEARCH-015)
      if (args.basisOfRecord) mapped.basisOfRecord = args.basisOfRecord;
      if (args.collector) mapped.collector = args.collector;
      // SEARCH-016: Spatial query support
      if (args.lat !== undefined) mapped.lat = args.lat;
      if (args.lon !== undefined) mapped.lon = args.lon;
      if (args.radiusKm !== undefined) mapped.radiusKm = args.radiusKm;
      break;

    case 'nma':
      mapped.query = query;
      mapped.limit = limit;
      // SEARCH-011: Map date to year, state to spatial
      if (dateFrom) mapped.year = parseInt(dateFrom, 10);
      if (state) mapped.spatial = mapStateToFull(state);
      if (args.medium) mapped.medium = args.medium;
      if (args.creator) mapped.creator = args.creator;
      break;

    case 'vhd':
      mapped.query = query;
      mapped.limit = limit;
      // VHD is Victoria-only, no state param needed
      // Map hasImages if provided in common args
      if (args.hasImages) mapped.hasImages = true;
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
      // SEARCH-016: Spatial query support
      if (args.lat !== undefined) mapped.lat = args.lat;
      if (args.lon !== undefined) mapped.lon = args.lon;
      if (args.radiusKm !== undefined) mapped.radiusKm = args.radiusKm;
      break;

    case 'ga-hap':
      // GA HAP doesn't use query - uses bbox/state/year
      if (dateFrom) mapped.yearFrom = parseInt(dateFrom, 10);
      if (dateTo) mapped.yearTo = parseInt(dateTo, 10);
      if (state) mapped.state = state.toUpperCase();
      mapped.limit = limit;
      mapped.scannedOnly = true; // Only return scanned photos
      // SEARCH-016: Spatial query support
      if (args.lat !== undefined) mapped.lat = args.lat;
      if (args.lon !== undefined) mapped.lon = args.lon;
      if (args.radiusKm !== undefined) mapped.radiusKm = args.radiusKm;
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

// ============================================================================
// Enhanced Routing (Phase 1 Research Planning)
// ============================================================================

/**
 * Maps research themes to relevant sources.
 * Used for intelligent source selection based on intent analysis.
 */
const THEME_SOURCE_MAP: Record<string, string[]> = {
  sports: ['trove', 'prov', 'museumsvic', 'nma'],
  architecture: ['vhd', 'trove', 'prov', 'ga-hap'],
  politics: ['trove', 'prov', 'nma'],
  military: ['trove', 'nma', 'prov'],
  indigenous: ['nma', 'trove', 'museumsvic'],
  nature: ['ala', 'museumsvic', 'trove'],
  transport: ['prov', 'trove', 'vhd', 'ga-hap'],
  immigration: ['prov', 'trove', 'nma'],
  gold: ['prov', 'trove', 'museumsvic', 'vhd'],
  film: ['acmi', 'trove', 'nma'],
  television: ['acmi', 'trove'],
  geography: ['ghap', 'ga-hap', 'trove'],
  heritage: ['vhd', 'trove', 'prov'],
  local: ['prov', 'trove', 'vhd', 'ghap'],
};

/**
 * Maps entity types to relevant sources.
 */
const ENTITY_SOURCE_MAP: Record<EntityType, string[]> = {
  person: ['trove', 'prov', 'nma', 'acmi'],
  place: ['ghap', 'vhd', 'ga-hap', 'trove', 'prov'],
  event: ['trove', 'prov', 'nma'],
  object: ['museumsvic', 'nma', 'prov'],
  organisation: ['trove', 'prov', 'nma'],
};

/**
 * Additional tools available for each source.
 */
const SOURCE_TOOLS: Record<string, string[]> = {
  prov: ['prov_search', 'prov_get_images', 'prov_harvest', 'prov_get_agency', 'prov_get_series'],
  trove: ['trove_search', 'trove_harvest', 'trove_newspaper_article', 'trove_get_work'],
  museumsvic: ['museumsvic_search', 'museumsvic_get_item', 'museumsvic_get_species', 'museumsvic_harvest'],
  ala: ['ala_search_occurrences', 'ala_search_species', 'ala_get_species', 'ala_harvest'],
  nma: ['nma_search_objects', 'nma_get_object', 'nma_search_places', 'nma_harvest'],
  vhd: ['vhd_search_places', 'vhd_get_place', 'vhd_search_shipwrecks', 'vhd_harvest'],
  acmi: ['acmi_search_works', 'acmi_get_work', 'acmi_harvest'],
  ghap: ['ghap_search', 'ghap_get_place', 'ghap_list_layers', 'ghap_harvest'],
  'ga-hap': ['ga_hap_search', 'ga_hap_get_photo', 'ga_hap_harvest'],
};

/**
 * Score a source's relevance to an intent analysis.
 *
 * @param source - Source identifier
 * @param intent - Intent analysis from query
 * @returns Score (0-100) and reason
 */
export function scoreSourceRelevance(source: string, intent: IntentAnalysis): RelevanceScore {
  let score = 0;
  const reasons: string[] = [];

  // Theme matching (up to 40 points)
  for (const theme of intent.themes) {
    const themeSources = THEME_SOURCE_MAP[theme];
    if (themeSources?.includes(source)) {
      const themeIndex = themeSources.indexOf(source);
      const themeScore = Math.max(0, 10 - themeIndex * 2);
      score += themeScore;
      reasons.push(`${theme} theme match`);
    }
  }
  score = Math.min(score, 40);

  // Entity type matching (up to 30 points)
  for (const entityType of intent.entityTypes) {
    const entitySources = ENTITY_SOURCE_MAP[entityType];
    if (entitySources?.includes(source)) {
      const entityIndex = entitySources.indexOf(source);
      const entityScore = Math.max(0, 10 - entityIndex * 2);
      score += entityScore;
      reasons.push(`${entityType} entity support`);
    }
  }
  score = Math.min(score, 70);

  // Location matching (up to 15 points)
  if (intent.locations.length > 0) {
    // Victoria-specific sources get bonus for VIC locations
    const hasVic = intent.locations.some((l) => l.state === 'VIC' || l.state === 'Victoria');
    if (hasVic && ['prov', 'vhd', 'museumsvic'].includes(source)) {
      score += 15;
      reasons.push('Victorian location match');
    } else if (intent.locations.length > 0 && ['ghap', 'trove'].includes(source)) {
      score += 10;
      reasons.push('Place-aware source');
    }
  }

  // Date range matching (up to 15 points)
  if (intent.dateRange) {
    const coverage = getExtendedCoverage(source);
    if (coverage) {
      const from = parseInt(intent.dateRange.from ?? '1788', 10);
      const to = parseInt(intent.dateRange.to ?? '2024', 10);
      if (coverage.fromYear <= from && coverage.toYear >= to) {
        score += 15;
        reasons.push('Full date coverage');
      } else if (coverage.fromYear <= to && coverage.toYear >= from) {
        score += 8;
        reasons.push('Partial date coverage');
      }
    }
  }

  const reason = reasons.length > 0 ? reasons.join(', ') : 'General relevance';
  return { score: Math.min(score, 100), reason };
}

/**
 * Suggest filters for a source based on intent analysis.
 *
 * @param source - Source identifier
 * @param intent - Intent analysis from query
 * @returns Suggested filter parameters
 */
export function suggestFilters(source: string, intent: IntentAnalysis): Record<string, unknown> {
  const filters: Record<string, unknown> = {};

  // Apply date range if detected
  if (intent.dateRange) {
    if (source === 'trove' || source === 'prov') {
      if (intent.dateRange.from) filters.dateFrom = intent.dateRange.from;
      if (intent.dateRange.to) filters.dateTo = intent.dateRange.to;
    } else if (source === 'ga-hap') {
      if (intent.dateRange.from) filters.yearFrom = parseInt(intent.dateRange.from, 10);
      if (intent.dateRange.to) filters.yearTo = parseInt(intent.dateRange.to, 10);
    } else if (source === 'ala') {
      if (intent.dateRange.from) filters.startYear = parseInt(intent.dateRange.from, 10);
      if (intent.dateRange.to) filters.endYear = parseInt(intent.dateRange.to, 10);
    }
  }

  // Apply state filter from locations
  const states = intent.locations
    .filter((l) => l.state)
    .map((l) => l.state);
  if (states.length > 0) {
    const state = states[0]; // Use first state
    if (['trove', 'ghap', 'ga-hap'].includes(source)) {
      filters.state = state;
    }
  }

  // Source-specific suggestions
  switch (source) {
    case 'trove':
      // Suggest newspaper category for historical research
      if (intent.themes.includes('politics') || intent.themes.includes('sports')) {
        filters.category = 'newspaper';
      }
      break;
    case 'prov':
      filters.digitisedOnly = true;
      break;
    case 'museumsvic':
      filters.hasImages = true;
      break;
    case 'ga-hap':
      filters.scannedOnly = true;
      break;
  }

  return filters;
}

/**
 * Determine optimal search order based on prioritised sources.
 *
 * @param prioritised - Prioritised sources with scores
 * @returns Ordered list of source names
 */
export function determineSearchOrder(prioritised: PrioritisedSource[]): string[] {
  // Already sorted by score, but apply additional heuristics

  // Group by relevance level
  const high = prioritised.filter((p) => p.relevance === 'high');
  const medium = prioritised.filter((p) => p.relevance === 'medium');
  const low = prioritised.filter((p) => p.relevance === 'low');

  // Within each group, prefer sources with broad content first
  const broadSources = ['trove', 'prov', 'nma'];
  const sortByBreadth = (a: PrioritisedSource, b: PrioritisedSource) => {
    const aIdx = broadSources.indexOf(a.source);
    const bIdx = broadSources.indexOf(b.source);
    if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
    if (aIdx >= 0) return -1;
    if (bIdx >= 0) return 1;
    return 0;
  };

  high.sort(sortByBreadth);
  medium.sort(sortByBreadth);
  low.sort(sortByBreadth);

  return [...high, ...medium, ...low].map((p) => p.source);
}

/**
 * Route sources based on intent analysis with relevance scoring.
 *
 * @param intent - Intent analysis from query
 * @param contentTypes - Optional content type filter
 * @returns Complete source prioritisation with reasoning
 */
export function routeSources(
  intent: IntentAnalysis,
  contentTypes?: ContentType[]
): SourcePrioritisation {
  const prioritised: PrioritisedSource[] = [];
  const excluded: ExcludedSource[] = [];

  // Score all sources
  for (const route of SOURCE_ROUTES) {
    // Check content type filter
    if (contentTypes && contentTypes.length > 0) {
      const hasMatchingType = route.types.some((t) => contentTypes.includes(t));
      if (!hasMatchingType) {
        excluded.push({
          source: route.source,
          reason: `Content types ${route.types.join(', ')} don't match requested ${contentTypes.join(', ')}`,
        });
        continue;
      }
    }

    // Check date coverage
    if (intent.dateRange) {
      const coverage = getExtendedCoverage(route.source);
      if (coverage) {
        const from = parseInt(intent.dateRange.from ?? '1788', 10);
        const to = parseInt(intent.dateRange.to ?? '2024', 10);
        if (coverage.toYear < from || coverage.fromYear > to) {
          excluded.push({
            source: route.source,
            reason: `Coverage ${coverage.fromYear}-${coverage.toYear} doesn't overlap ${from}-${to}`,
          });
          continue;
        }
      }
    }

    // Score relevance
    const { score, reason } = scoreSourceRelevance(route.source, intent);

    // Determine relevance level
    let relevance: RelevanceLevel;
    if (score >= 50) {
      relevance = 'high';
    } else if (score >= 25) {
      relevance = 'medium';
    } else {
      relevance = 'low';
    }

    // Get suggested filters and tools
    const suggestedFilters = suggestFilters(route.source, intent);
    const suggestedTools = SOURCE_TOOLS[route.source] ?? [route.tool];

    prioritised.push({
      source: route.source,
      tool: route.tool,
      relevance,
      reason,
      suggestedTools,
      suggestedFilters,
      score,
    });
  }

  // Sort by score descending
  prioritised.sort((a, b) => b.score - a.score);

  // Determine search order
  const searchOrder = determineSearchOrder(prioritised);

  return {
    prioritised,
    excluded,
    searchOrder,
  };
}
