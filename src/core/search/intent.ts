/**
 * Query Intent Classification
 *
 * Keyword-based classification to determine what type of content
 * the user is likely searching for, and which sources are most relevant.
 * Enhanced with location/date/entity extraction for research planning.
 * @module core/search/intent
 */

import { ghapClient } from '../../sources/ghap/client.js';

// ============================================================================
// Types - Original (backward compatibility)
// ============================================================================

export type QueryIntent =
  | 'heritage'
  | 'natural_history'
  | 'government'
  | 'media'
  | 'newspaper'
  | 'photograph'
  | 'genealogy'
  | 'geographic'
  | 'general';

export interface IntentResult {
  /** Detected intent */
  intent: QueryIntent;
  /** Confidence score (0-1) */
  confidence: number;
  /** Sources recommended for this intent */
  recommendedSources: string[];
  /** Keywords that triggered this intent */
  matchedKeywords: string[];
}

// ============================================================================
// Types - Enhanced (Phase 1 Research Planning)
// ============================================================================

/** Research intent for planning purposes */
export type ResearchIntent = 'discovery' | 'verification' | 'deep-dive' | 'comparison';

/** Entity types that can be researched */
export type EntityType = 'person' | 'place' | 'event' | 'object' | 'organisation';

/** Location match from GHAP validation */
export interface LocationMatch {
  /** Place name as found in query */
  name: string;
  /** Australian state (from GHAP lookup) */
  state?: string;
  /** GHAP place ID for further enrichment */
  ghapId?: string;
  /** Whether this was validated via GHAP */
  validated: boolean;
}

/** Date range extracted from query */
export interface ExtractedDateRange {
  from?: string;
  to?: string;
  /** Original text that was parsed */
  original: string;
  /** Confidence in extraction (0-1) */
  confidence: number;
}

/** Full intent analysis for research planning */
export interface IntentAnalysis {
  /** Multiple themes detected (sports, architecture, etc.) */
  themes: string[];
  /** Place names detected and validated */
  locations: LocationMatch[];
  /** Extracted date range */
  dateRange: ExtractedDateRange | null;
  /** Entity types being researched */
  entityTypes: EntityType[];
  /** Research intent */
  intent: ResearchIntent;
  /** Overall confidence score (0-1) */
  confidence: number;
  /** Original query for reference */
  query: string;
  /** Legacy intent result for backward compat */
  legacyIntent: IntentResult;
}

// ============================================================================
// Constants - Australian States
// ============================================================================

const AUSTRALIAN_STATES = [
  'victoria', 'vic',
  'new south wales', 'nsw',
  'queensland', 'qld',
  'south australia', 'sa',
  'western australia', 'wa',
  'tasmania', 'tas',
  'northern territory', 'nt',
  'australian capital territory', 'act',
];

const STATE_ABBREVIATIONS: Record<string, string> = {
  vic: 'VIC', victoria: 'VIC',
  nsw: 'NSW', 'new south wales': 'NSW',
  qld: 'QLD', queensland: 'QLD',
  sa: 'SA', 'south australia': 'SA',
  wa: 'WA', 'western australia': 'WA',
  tas: 'TAS', tasmania: 'TAS',
  nt: 'NT', 'northern territory': 'NT',
  act: 'ACT', 'australian capital territory': 'ACT',
};

// ============================================================================
// Capital Cities (for location disambiguation)
// ============================================================================

/**
 * Capital cities with their state - used to prioritize major cities
 * over minor placenames with the same name.
 */
const CAPITAL_CITIES = new Map<string, string>([
  ['melbourne', 'VIC'],
  ['sydney', 'NSW'],
  ['brisbane', 'QLD'],
  ['perth', 'WA'],
  ['adelaide', 'SA'],
  ['hobart', 'TAS'],
  ['darwin', 'NT'],
  ['canberra', 'ACT'],
]);

// ============================================================================
// Location Stoplist (to prevent false positives)
// ============================================================================

/**
 * Words that should NOT be matched as locations via GHAP.
 * These are common English words that happen to match minor placenames.
 */
const LOCATION_STOPLIST = new Set([
  // Species names (match to minor placenames like "Platypus, QLD")
  'platypus', 'koala', 'kangaroo', 'wombat', 'echidna', 'possum', 'emu',
  'wallaby', 'dingo', 'bilby', 'quokka', 'numbat', 'bandicoot',
  // Content types
  'photographs', 'photograph', 'documents', 'records', 'archives',
  'letters', 'maps', 'articles', 'newspapers', 'images', 'pictures',
  // Research terms
  'heritage', 'historical', 'colonial', 'aboriginal', 'indigenous',
  'historic', 'ancient', 'old', 'early', 'modern',
  // Photography terms
  'aerial', 'panorama', 'portrait', 'landscape', 'studio', 'snapshot',
  // Common adjectives/nouns that match placenames
  'royal', 'diamond', 'golden', 'victory', 'union', 'hope', 'sunrise',
  'sunset', 'paradise', 'pleasant', 'happy', 'lucky',
]);

// ============================================================================
// Intent Keywords
// ============================================================================

/**
 * Keywords that trigger each intent type.
 * Keywords are matched case-insensitively against the query.
 */
const INTENT_KEYWORDS: Record<QueryIntent, string[]> = {
  heritage: [
    'heritage', 'building', 'architecture', 'historic', 'listed', 'victorian',
    'edwardian', 'federation', 'bluestone', 'terrace', 'mansion', 'church',
    'station', 'monument', 'memorial', 'landmark', 'conservation',
  ],
  natural_history: [
    'species', 'animal', 'plant', 'specimen', 'wildlife', 'biodiversity',
    'fauna', 'flora', 'bird', 'mammal', 'reptile', 'insect', 'fish',
    'botanical', 'zoological', 'native', 'endangered', 'marsupial',
  ],
  government: [
    'prime minister', 'parliament', 'policy', 'legislation', 'minister',
    'government', 'cabinet', 'election', 'referendum', 'senator',
    'governor', 'colonial', 'administration', 'public service',
  ],
  media: [
    'film', 'movie', 'cinema', 'television', 'tv', 'videogame', 'documentary',
    'animation', 'director', 'actor', 'actress', 'studio', 'production',
    'broadcast', 'series', 'episode',
  ],
  newspaper: [
    'newspaper', 'article', 'gazette', 'news', 'reporter', 'journalist',
    'editor', 'headline', 'obituary', 'advertisement', 'classified',
  ],
  photograph: [
    'photo', 'photograph', 'image', 'picture', 'aerial', 'snapshot',
    'portrait', 'studio', 'album', 'daguerreotype', 'lantern slide',
  ],
  genealogy: [
    'family', 'birth', 'death', 'marriage', 'cemetery', 'passenger',
    'immigration', 'emigration', 'shipping', 'convict', 'settler',
    'ancestor', 'descendant', 'genealogy', 'surname', 'baptism',
  ],
  geographic: [
    'placename', 'location', 'coordinates', 'map', 'survey', 'boundary',
    'parish', 'township', 'district', 'county', 'geography', 'terrain',
  ],
  general: [], // Catch-all, no specific keywords
};

/**
 * Sources recommended for each intent type.
 * Order matters - higher priority sources first.
 */
const INTENT_SOURCES: Record<QueryIntent, string[]> = {
  heritage: ['vhd', 'prov', 'trove', 'nma'],
  natural_history: ['ala', 'museumsvic', 'nma'],
  government: ['prov', 'trove'],
  media: ['acmi', 'trove', 'nma'],
  newspaper: ['trove'],
  photograph: ['prov', 'trove', 'nma', 'museumsvic', 'ga-hap'],
  genealogy: ['trove', 'prov'],
  geographic: ['ghap', 'ga-hap', 'prov'],
  general: ['trove', 'prov', 'nma', 'museumsvic'],
};

// ============================================================================
// Classification
// ============================================================================

/**
 * Classify query intent based on keyword matching.
 *
 * @param query - Search query string
 * @returns Intent classification with confidence and recommendations
 */
export function classifyIntent(query: string): IntentResult {
  const queryLower = query.toLowerCase();
  const queryWords = new Set(queryLower.split(/\s+/));

  const scores: { intent: QueryIntent; score: number; matches: string[] }[] = [];

  // Score each intent
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [QueryIntent, string[]][]) {
    if (intent === 'general') continue; // Skip general for scoring

    let score = 0;
    const matches: string[] = [];

    for (const keyword of keywords) {
      // Exact word match (higher score)
      if (keyword.includes(' ')) {
        // Multi-word keyword
        if (queryLower.includes(keyword)) {
          score += 3;
          matches.push(keyword);
        }
      } else if (queryWords.has(keyword)) {
        score += 2;
        matches.push(keyword);
      } else if (queryLower.includes(keyword)) {
        // Substring match (lower score)
        score += 1;
        matches.push(keyword);
      }
    }

    if (score > 0) {
      scores.push({ intent, score, matches });
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Return top match or general
  if (scores.length > 0 && scores[0].score >= 2) {
    const top = scores[0];
    // Confidence based on score (normalised to 0-1)
    const confidence = Math.min(top.score / 10, 1);

    return {
      intent: top.intent,
      confidence,
      recommendedSources: INTENT_SOURCES[top.intent],
      matchedKeywords: top.matches,
    };
  }

  // Default to general
  return {
    intent: 'general',
    confidence: 0.5,
    recommendedSources: INTENT_SOURCES.general,
    matchedKeywords: [],
  };
}

/**
 * Get recommended sources for an intent.
 *
 * @param intent - Query intent
 * @returns Array of source identifiers
 */
export function getSourcesForIntent(intent: QueryIntent): string[] {
  return INTENT_SOURCES[intent] ?? INTENT_SOURCES.general;
}

// ============================================================================
// Enhanced Intent Analysis - Constants
// ============================================================================

/** Keywords for entity type detection */
const ENTITY_KEYWORDS: Record<EntityType, string[]> = {
  person: [
    'who', 'person', 'people', 'man', 'woman', 'he', 'she', 'family',
    'surname', 'biography', 'life', 'born', 'died', 'lived',
  ],
  place: [
    'where', 'place', 'location', 'site', 'building', 'street', 'oval',
    'ground', 'park', 'station', 'suburb', 'city', 'town', 'area',
  ],
  event: [
    'when', 'event', 'happened', 'occurred', 'match', 'game', 'battle',
    'opening', 'ceremony', 'flood', 'fire', 'disaster', 'election',
  ],
  object: [
    'what', 'object', 'artefact', 'artifact', 'item', 'document',
    'photograph', 'letter', 'trophy', 'medal', 'uniform',
  ],
  organisation: [
    'club', 'team', 'company', 'society', 'association', 'league',
    'committee', 'council', 'government', 'department', 'agency',
  ],
};

/** Keywords for research intent classification */
const RESEARCH_INTENT_KEYWORDS: Record<ResearchIntent, string[]> = {
  discovery: [
    'find', 'search', 'looking for', 'discover', 'explore', 'what',
    'any', 'about', 'history of', 'information on',
  ],
  verification: [
    'confirm', 'verify', 'check', 'true', 'correct', 'accurate',
    'did', 'was', 'when exactly', 'source for',
  ],
  'deep-dive': [
    'everything', 'all', 'comprehensive', 'detailed', 'complete',
    'full history', 'in-depth', 'thorough', 'extensive',
  ],
  comparison: [
    'compare', 'versus', 'vs', 'difference', 'between', 'contrast',
    'similar', 'different', 'both', 'either',
  ],
};

/** Theme keywords for research categorisation */
const THEME_KEYWORDS: Record<string, string[]> = {
  sports: [
    'football', 'cricket', 'racing', 'horse', 'rugby', 'tennis', 'golf',
    'swimming', 'athletics', 'vfl', 'afl', 'league', 'club', 'team',
    'oval', 'ground', 'stadium', 'match', 'game', 'premiership',
  ],
  architecture: [
    'building', 'architecture', 'design', 'construction', 'heritage',
    'facade', 'bluestone', 'victorian', 'edwardian', 'art deco',
  ],
  local_history: [
    'suburb', 'council', 'local', 'neighbourhood', 'community',
    'residents', 'municipal', 'shire',
  ],
  transport: [
    'railway', 'train', 'tram', 'bus', 'road', 'bridge', 'station',
    'port', 'wharf', 'shipping', 'airline', 'aviation',
  ],
  politics: [
    'government', 'parliament', 'election', 'politician', 'minister',
    'premier', 'mayor', 'councillor', 'policy', 'legislation',
  ],
  environment: [
    'river', 'creek', 'park', 'garden', 'tree', 'flood', 'drought',
    'climate', 'weather', 'wildlife', 'conservation',
  ],
  // BUG-004: Add biodiversity theme for ALA prioritization
  biodiversity: [
    'species', 'fauna', 'flora', 'wildlife', 'biodiversity', 'animal',
    'plant', 'specimen', 'sightings', 'observations', 'occurrence',
    'platypus', 'koala', 'kangaroo', 'wombat', 'echidna', 'possum',
    'bird', 'mammal', 'reptile', 'insect', 'fish', 'marsupial',
  ],
  // BUG-002: Add photography theme for GA-HAP prioritization
  photography: [
    'photograph', 'photo', 'image', 'picture', 'aerial', 'airphoto',
    'snapshot', 'portrait', 'studio', 'daguerreotype', 'lantern slide',
    'overhead', 'survey', 'flight',
  ],
};

/** Date extraction patterns with extractors */
const DATE_PATTERNS: Array<{
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => ExtractedDateRange;
}> = [
  // Decade: "1920s", "the 1920s"
  {
    pattern: /\b(?:the\s+)?(\d{4})s\b/i,
    extract: (match) => ({
      from: match[1],
      to: String(parseInt(match[1], 10) + 9),
      original: match[0],
      confidence: 0.9,
    }),
  },
  // Year range: "1920-1930", "1920 to 1930"
  {
    pattern: /\b(?:from\s+)?(\d{4})\s*(?:-|to)\s*(\d{4})\b/i,
    extract: (match) => ({
      from: match[1],
      to: match[2],
      original: match[0],
      confidence: 0.95,
    }),
  },
  // Era phrases: "early twentieth century"
  {
    pattern: /\b(early|mid|late)\s+(nineteenth|twentieth|18th|19th|20th)\s+century\b/i,
    extract: (match) => {
      const period = match[1].toLowerCase();
      const century = match[2].toLowerCase();
      let baseYear = 1900;
      if (century.includes('nineteenth') || century.includes('19th')) baseYear = 1800;
      if (century.includes('18th')) baseYear = 1700;

      let from: string, to: string;
      if (period === 'early') {
        from = String(baseYear);
        to = String(baseYear + 33);
      } else if (period === 'mid') {
        from = String(baseYear + 33);
        to = String(baseYear + 66);
      } else {
        from = String(baseYear + 66);
        to = String(baseYear + 99);
      }
      return { from, to, original: match[0], confidence: 0.7 };
    },
  },
  // "pre-1900", "before 1900"
  {
    pattern: /\b(?:pre-?|before\s+)(\d{4})\b/i,
    extract: (match) => ({
      from: undefined,
      to: String(parseInt(match[1], 10) - 1),
      original: match[0],
      confidence: 0.85,
    }),
  },
  // "post-1900", "after 1900"
  {
    pattern: /\b(?:post-?|after\s+)(\d{4})\b/i,
    extract: (match) => ({
      from: String(parseInt(match[1], 10) + 1),
      to: undefined,
      original: match[0],
      confidence: 0.85,
    }),
  },
  // Single year: "in 1920", "1920" (lower priority)
  {
    pattern: /\b(?:in\s+)?(\d{4})\b/i,
    extract: (match) => ({
      from: match[1],
      to: match[1],
      original: match[0],
      confidence: 0.8,
    }),
  },
];

// ============================================================================
// Enhanced Intent Analysis - Functions
// ============================================================================

/**
 * Extract potential place names from query using heuristics.
 * Looks for capitalised multi-word terms that might be place names.
 *
 * @param query - Search query string
 * @returns Array of potential place name strings
 */
export function extractPotentialLocations(query: string): string[] {
  const locations: string[] = [];

  // Skip common non-place words
  const skipWords = new Set([
    'the', 'a', 'an', 'in', 'on', 'at', 'for', 'of', 'and',
    'history', 'club', 'football', 'cricket', 'team', 'league',
  ]);

  // Pattern 1: Capitalised multi-word sequences (e.g., "North Melbourne")
  const capitalPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  let match;
  while ((match = capitalPattern.exec(query)) !== null) {
    const candidate = match[1];
    const words = candidate.toLowerCase().split(/\s+/);
    // Skip if all words are common non-place words
    if (!words.every((w) => skipWords.has(w)) && candidate.length > 2) {
      // BUG-003: Filter single-word stoplist terms (multi-word like "Platypus Creek" allowed)
      if (words.length === 1 && LOCATION_STOPLIST.has(words[0])) {
        continue;
      }
      locations.push(candidate);
    }
  }

  // Pattern 2: Known place suffixes (Street, Road, Oval, etc.)
  const suffixPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|Road|Avenue|Lane|Place|Oval|Ground|Park|Station|Bridge|River|Creek))\b/gi;
  while ((match = suffixPattern.exec(query)) !== null) {
    if (!locations.includes(match[1])) {
      locations.push(match[1]);
    }
  }

  return [...new Set(locations)];
}

/**
 * Validate potential location names via GHAP lookup.
 * Returns validated locations with state info and GHAP IDs.
 *
 * @param potentialLocations - Array of potential place names
 * @returns Array of validated location matches
 */
export async function validateLocationsViaGHAP(
  potentialLocations: string[]
): Promise<LocationMatch[]> {
  const validated: LocationMatch[] = [];

  for (const name of potentialLocations) {
    try {
      // BUG-001: Check if this is a capital city first
      const nameLower = name.toLowerCase();
      const capitalState = CAPITAL_CITIES.get(nameLower);

      if (capitalState) {
        // Capital city - use known state directly (no GHAP needed)
        validated.push({
          name: name,
          state: capitalState,
          validated: true,
        });
        continue;
      }

      // Query GHAP with fuzzy name matching (increased limit for disambiguation)
      const result = await ghapClient.search({
        fuzzyname: name,
        limit: 10,
      });

      if (result.places.length > 0) {
        // BUG-001: Prioritize results - prefer capital cities, then by name match
        let bestPlace = result.places[0];

        for (const place of result.places) {
          const placeLower = place.name.toLowerCase();
          // Check if any result is a capital city
          const placeCapitalState = CAPITAL_CITIES.get(placeLower);
          if (placeCapitalState && place.state === placeCapitalState) {
            bestPlace = place;
            break;
          }
          // Prefer exact name match over fuzzy match
          if (placeLower === nameLower && bestPlace.name.toLowerCase() !== nameLower) {
            bestPlace = place;
          }
        }

        validated.push({
          name: bestPlace.name,
          state: bestPlace.state,
          ghapId: bestPlace.id,
          validated: true,
        });
      } else {
        // Keep unvalidated for potential use
        validated.push({
          name,
          validated: false,
        });
      }
    } catch {
      // GHAP unavailable - keep as unvalidated
      validated.push({
        name,
        validated: false,
      });
    }
  }

  return validated;
}

/**
 * Extract date range from query using pattern matching.
 *
 * @param query - Search query string
 * @returns Extracted date range or null if none found
 */
export function extractDateRange(query: string): ExtractedDateRange | null {
  for (const { pattern, extract } of DATE_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      return extract(match);
    }
  }
  return null;
}

/**
 * Extract entity types being researched from query.
 *
 * @param query - Search query string
 * @returns Array of detected entity types
 */
export function extractEntityTypes(query: string): EntityType[] {
  const queryLower = query.toLowerCase();
  const detected: EntityType[] = [];

  for (const [entityType, keywords] of Object.entries(ENTITY_KEYWORDS) as [
    EntityType,
    string[],
  ][]) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword)) {
        if (!detected.includes(entityType)) {
          detected.push(entityType);
        }
        break;
      }
    }
  }

  // Default to 'place' if nothing detected
  if (detected.length === 0) {
    detected.push('place');
  }

  return detected;
}

/**
 * Extract themes from query using keyword matching.
 *
 * @param query - Search query string
 * @returns Array of detected theme strings
 */
export function extractThemes(query: string): string[] {
  const queryLower = query.toLowerCase();
  const themes: string[] = [];

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword)) {
        if (!themes.includes(theme)) {
          themes.push(theme);
        }
        break;
      }
    }
  }

  // Also add legacy intent as theme if specific
  const legacyIntent = classifyIntent(query);
  if (legacyIntent.intent !== 'general' && !themes.includes(legacyIntent.intent)) {
    themes.push(legacyIntent.intent);
  }

  return themes.length > 0 ? themes : ['general'];
}

/**
 * Classify research intent from query.
 *
 * @param query - Search query string
 * @returns Research intent classification
 */
export function classifyResearchIntent(query: string): ResearchIntent {
  const queryLower = query.toLowerCase();

  const scores: { intent: ResearchIntent; score: number }[] = [];

  for (const [intent, keywords] of Object.entries(RESEARCH_INTENT_KEYWORDS) as [
    ResearchIntent,
    string[],
  ][]) {
    let score = 0;
    for (const keyword of keywords) {
      if (queryLower.includes(keyword)) {
        score += keyword.includes(' ') ? 2 : 1;
      }
    }
    if (score > 0) {
      scores.push({ intent, score });
    }
  }

  scores.sort((a, b) => b.score - a.score);

  if (scores.length > 0 && scores[0].score >= 1) {
    return scores[0].intent;
  }

  // Default to discovery
  return 'discovery';
}

/**
 * Detect Australian state from query.
 *
 * @param query - Search query string
 * @returns State abbreviation or undefined
 */
export function detectState(query: string): string | undefined {
  const queryLower = query.toLowerCase();

  for (const state of AUSTRALIAN_STATES) {
    if (queryLower.includes(state)) {
      return STATE_ABBREVIATIONS[state];
    }
  }

  return undefined;
}

/**
 * Perform full intent analysis for research planning.
 * This is async because it uses GHAP for location validation.
 *
 * @param query - Search query string
 * @returns Full intent analysis with themes, locations, dates, and entity types
 */
export async function analyzeIntent(query: string): Promise<IntentAnalysis> {
  // Get legacy intent for backward compat
  const legacyIntent = classifyIntent(query);

  // Extract potential locations
  const potentialLocations = extractPotentialLocations(query);

  // Validate locations via GHAP (async)
  const locations = await validateLocationsViaGHAP(potentialLocations);

  // Add state detection as reference if no validated places
  const detectedState = detectState(query);
  if (detectedState && !locations.some((l) => l.state === detectedState)) {
    locations.push({
      name: detectedState,
      state: detectedState,
      validated: true,
    });
  }

  // Extract other components (sync)
  const themes = extractThemes(query);
  const dateRange = extractDateRange(query);
  const entityTypes = extractEntityTypes(query);
  const intent = classifyResearchIntent(query);

  // Calculate overall confidence
  const confidenceFactors = [
    themes.length > 0 && themes[0] !== 'general' ? 0.2 : 0,
    locations.filter((l) => l.validated).length > 0 ? 0.3 : 0,
    dateRange !== null ? 0.2 : 0,
    entityTypes.length > 0 ? 0.15 : 0,
    legacyIntent.confidence * 0.15,
  ];
  const confidence = Math.min(
    confidenceFactors.reduce((a, b) => a + b, 0.3),
    1
  );

  return {
    themes,
    locations,
    dateRange,
    entityTypes,
    intent,
    confidence,
    query,
    legacyIntent,
  };
}
