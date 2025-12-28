/**
 * Cross-Source Result Ranking
 *
 * Scores and ranks results from multiple sources for optimal relevance.
 * @module core/search/ranker
 */

import type { QueryIntent } from './intent.js';

// ============================================================================
// Types
// ============================================================================

export interface RankedRecord {
  /** Original record from source */
  record: unknown;
  /** Source identifier */
  source: string;
  /** Composite relevance score (0-1) */
  score: number;
  /** Score breakdown */
  scoreBreakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  /** Score for having an image */
  imageScore: number;
  /** Score for being digitised */
  digitisedScore: number;
  /** Score for intent-source alignment */
  intentScore: number;
  /** Score for date proximity */
  dateScore: number;
}

export interface RankingConfig {
  /** Detected intent (optional) */
  intent?: QueryIntent;
  /** Target year for date proximity scoring */
  targetYear?: number;
  /** Sources that match the detected intent */
  intentSources?: string[];
}

// ============================================================================
// Scoring Weights
// ============================================================================

const WEIGHTS = {
  image: 0.25,
  digitised: 0.15,
  intent: 0.35,
  date: 0.25,
};

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Score a single record.
 *
 * @param record - Record from a source
 * @param source - Source identifier
 * @param config - Ranking configuration
 * @returns Ranked record with scores
 */
export function scoreRecord(
  record: unknown,
  source: string,
  config: RankingConfig
): RankedRecord {
  const r = record as Record<string, unknown>;

  // Image score
  const hasImage = Boolean(
    r.thumbnailUrl || r.imageUrl || r.previewUrl ||
    (Array.isArray(r.media) && r.media.length > 0) ||
    r.hasImage === true || r.hasImages === true
  );
  const imageScore = hasImage ? 1 : 0;

  // Digitised score
  const isDigitised = Boolean(
    r.digitised === true ||
    r.isDigitised === true ||
    r.scanned === true ||
    r.online === true ||
    hasImage // Having an image implies digitised
  );
  const digitisedScore = isDigitised ? 1 : 0;

  // Intent score
  let intentScore = 0.5; // Default neutral
  if (config.intent && config.intentSources) {
    if (config.intentSources.includes(source)) {
      // Source matches intent - score based on position
      const idx = config.intentSources.indexOf(source);
      intentScore = 1 - (idx * 0.1); // First source = 1, second = 0.9, etc.
    } else {
      intentScore = 0.2; // Source doesn't match intent
    }
  }

  // Date score
  let dateScore = 0.5; // Default neutral
  if (config.targetYear) {
    const recordYear = extractYear(r);
    if (recordYear) {
      const diff = Math.abs(recordYear - config.targetYear);
      // Score decreases with distance (5 years = 0.9, 50 years = 0.5, etc.)
      dateScore = Math.max(0.1, 1 - (diff / 100));
    }
  }

  // Calculate composite score
  const score =
    WEIGHTS.image * imageScore +
    WEIGHTS.digitised * digitisedScore +
    WEIGHTS.intent * intentScore +
    WEIGHTS.date * dateScore;

  return {
    record,
    source,
    score,
    scoreBreakdown: {
      imageScore,
      digitisedScore,
      intentScore,
      dateScore,
    },
  };
}

/**
 * Rank records from multiple sources.
 *
 * @param records - Array of {source, records} objects
 * @param config - Ranking configuration
 * @returns Ranked and sorted records
 */
export function rankRecords(
  records: Array<{ source: string; records: unknown[] }>,
  config: RankingConfig
): RankedRecord[] {
  const ranked: RankedRecord[] = [];

  for (const { source, records: sourceRecords } of records) {
    for (const record of sourceRecords) {
      ranked.push(scoreRecord(record, source, config));
    }
  }

  // Sort by score descending
  ranked.sort((a, b) => b.score - a.score);

  return ranked;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extract a year from a record.
 * Checks common date fields.
 */
function extractYear(record: Record<string, unknown>): number | undefined {
  // Check common year fields
  const yearFields = ['year', 'yearStart', 'year_start', 'date', 'dateCreated', 'eventDate'];

  for (const field of yearFields) {
    const value = record[field];
    if (typeof value === 'number' && value > 1000 && value < 3000) {
      return value;
    }
    if (typeof value === 'string') {
      // Try to extract year from string
      const match = value.match(/\b(1[789]\d{2}|20[0-2]\d)\b/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
  }

  // Check nested date objects
  if (typeof record.date === 'object' && record.date !== null) {
    const dateObj = record.date as Record<string, unknown>;
    if (typeof dateObj.year === 'number') {
      return dateObj.year;
    }
  }

  return undefined;
}

/**
 * Deduplicate records by title similarity.
 * Groups records with similar titles and keeps highest-scored.
 *
 * @param ranked - Ranked records
 * @param threshold - Similarity threshold (0-1)
 * @returns Deduplicated records with "also in" annotations
 */
export function deduplicateByTitle(
  ranked: RankedRecord[],
  threshold = 0.8
): RankedRecord[] {
  const groups: Map<string, RankedRecord[]> = new Map();

  for (const record of ranked) {
    const title = extractTitle(record.record);
    const normalisedTitle = normaliseTitle(title);

    // Find existing group with similar title
    let foundGroup = false;
    for (const [groupTitle, groupRecords] of groups) {
      if (titleSimilarity(normalisedTitle, groupTitle) >= threshold) {
        groupRecords.push(record);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.set(normalisedTitle, [record]);
    }
  }

  // Keep best from each group, annotate with "also in"
  const deduplicated: RankedRecord[] = [];

  for (const groupRecords of groups.values()) {
    // Sort by score
    groupRecords.sort((a, b) => b.score - a.score);
    const best = groupRecords[0];

    // Add "alsoIn" annotation if duplicates exist
    if (groupRecords.length > 1) {
      const alsoIn = groupRecords.slice(1).map((r) => r.source);
      const r = best.record as Record<string, unknown>;
      r._alsoIn = alsoIn;
    }

    deduplicated.push(best);
  }

  // Sort by score again
  deduplicated.sort((a, b) => b.score - a.score);

  return deduplicated;
}

/**
 * Extract title from a record.
 */
function extractTitle(record: unknown): string {
  const r = record as Record<string, unknown>;
  return String(
    r.title ?? r.displayTitle ?? r.name ?? r.headline ?? ''
  );
}

/**
 * Normalise a title for comparison.
 */
function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalise whitespace
    .trim();
}

/**
 * Calculate similarity between two titles (0-1).
 * Uses simple word overlap for efficiency.
 */
function titleSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;

  const wordsA = new Set(a.split(' '));
  const wordsB = new Set(b.split(' '));

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return overlap / union;
}
