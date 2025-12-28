/**
 * Query Intent Classification
 *
 * Keyword-based classification to determine what type of content
 * the user is likely searching for, and which sources are most relevant.
 * @module core/search/intent
 */

// ============================================================================
// Types
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
