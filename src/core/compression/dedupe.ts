/**
 * Standalone Deduplication Module
 *
 * Phase 3: Remove duplicate results from a batch of records.
 *
 * This is different from session fingerprinting (Phase 2):
 * - Session fingerprinting: tracks across multiple queries over time
 * - This module: dedupes a single batch (e.g., federated search output)
 *
 * Deduplication strategy (priority order):
 * 1. URL matching (primary) - exact match after normalisation
 * 2. Title similarity (fallback) - Jaccard coefficient threshold
 * 3. Year proximity - same title within ±N years
 */

import type {
  DedupeOptions,
  DedupeResult,
  DedupeMatchType,
  DuplicateInfo,
} from './types.js';
import {
  SAME_SOURCE_THRESHOLD,
  CROSS_SOURCE_THRESHOLD,
  DEFAULT_YEAR_PROXIMITY,
  DEFAULT_SOURCE_PRIORITY,
  createDefaultDedupeOptions,
  createEmptyDedupeStats,
} from './types.js';
import { extractYear } from './compressor.js';

// ============================================================================
// URL Normalisation
// ============================================================================

/**
 * Normalise a URL for comparison
 * - Lowercase
 * - Remove trailing slashes
 * - Sort query parameters
 * - Remove fragments
 */
export function normaliseUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    // Lowercase host
    parsed.hostname = parsed.hostname.toLowerCase();

    // Remove trailing slash from pathname
    if (parsed.pathname.endsWith('/') && parsed.pathname !== '/') {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    // Sort query parameters
    const params = new URLSearchParams(parsed.searchParams);
    const sortedParams = new URLSearchParams(
      [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    );
    parsed.search = sortedParams.toString() ? `?${sortedParams.toString()}` : '';

    // Remove fragment
    parsed.hash = '';

    return parsed.toString().toLowerCase();
  } catch {
    // If URL is invalid, just lowercase and trim
    return url.toLowerCase().trim();
  }
}

// ============================================================================
// Title Processing
// ============================================================================

/**
 * Normalise title for comparison
 * - Lowercase
 * - Remove punctuation
 * - Collapse whitespace
 */
export function normaliseTitle(title: string): string {
  if (!title) return '';

  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Calculate Jaccard similarity between two titles
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export function titleSimilarity(title1: string, title2: string): number {
  const normalised1 = normaliseTitle(title1);
  const normalised2 = normaliseTitle(title2);

  if (!normalised1 || !normalised2) return 0;
  if (normalised1 === normalised2) return 1;

  // Tokenise into word sets
  const words1 = new Set(normalised1.split(' ').filter((w) => w.length > 0));
  const words2 = new Set(normalised2.split(' ').filter((w) => w.length > 0));

  if (words1.size === 0 || words2.size === 0) return 0;

  // Calculate Jaccard similarity: |intersection| / |union|
  let intersectionSize = 0;
  for (const word of words1) {
    if (words2.has(word)) {
      intersectionSize++;
    }
  }

  const unionSize = words1.size + words2.size - intersectionSize;
  return intersectionSize / unionSize;
}

// ============================================================================
// Field Extraction
// ============================================================================

/**
 * Extract URL from a record
 */
function extractUrl(record: Record<string, unknown>): string | undefined {
  const urlFields = ['url', 'link', 'href', 'webUrl', 'recordUrl', 'manifestUrl'];

  for (const field of urlFields) {
    const value = record[field];
    if (typeof value === 'string' && value.startsWith('http')) {
      return value;
    }
  }

  // Check nested links
  if (typeof record.links === 'object' && record.links !== null) {
    const links = record.links as Record<string, unknown>;
    if (typeof links.self === 'string') return links.self;
    if (typeof links.html === 'string') return links.html;
  }

  return undefined;
}

/**
 * Extract title from a record
 */
function extractTitle(record: Record<string, unknown>): string | undefined {
  const titleFields = ['title', 'name', 'heading', 'label'];

  for (const field of titleFields) {
    const value = record[field];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

/**
 * Extract source from a record
 */
function extractSource(record: Record<string, unknown>): string {
  if (typeof record.source === 'string') return record.source;
  if (typeof record._source === 'string') return record._source;
  return 'unknown';
}

/**
 * Extract ID from a record
 */
function extractId(record: Record<string, unknown>): string {
  const idFields = ['id', 'recordId', 'workId', 'articleId', 'objectId', 'placeId'];

  for (const field of idFields) {
    if (record[field] !== undefined && record[field] !== null) {
      return String(record[field]);
    }
  }

  return `record-${Math.random().toString(36).slice(2, 10)}`;
}

// ============================================================================
// Duplicate Detection
// ============================================================================

/**
 * Check if two records are duplicates
 */
export function areDuplicates(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  options?: DedupeOptions
): { isDuplicate: boolean; matchType?: DedupeMatchType } {
  const opts = { ...createDefaultDedupeOptions(), ...options };
  const { strategy, titleThreshold, yearProximity } = opts;

  const sourceA = extractSource(a);
  const sourceB = extractSource(b);

  // URL matching
  if (strategy === 'url' || strategy === 'both') {
    const urlA = extractUrl(a);
    const urlB = extractUrl(b);

    if (urlA && urlB) {
      const normA = normaliseUrl(urlA);
      const normB = normaliseUrl(urlB);

      if (normA === normB) {
        return { isDuplicate: true, matchType: 'url' };
      }
    }
  }

  // Title matching
  if (strategy === 'title' || strategy === 'both') {
    const titleA = extractTitle(a);
    const titleB = extractTitle(b);

    if (titleA && titleB) {
      const similarity = titleSimilarity(titleA, titleB);

      // Use appropriate threshold based on source
      const threshold =
        sourceA === sourceB
          ? (titleThreshold ?? SAME_SOURCE_THRESHOLD)
          : CROSS_SOURCE_THRESHOLD;

      if (similarity >= threshold) {
        // Check year proximity if titles are similar
        const yearA = extractYear(a);
        const yearB = extractYear(b);

        if (yearA && yearB) {
          const yearDiff = Math.abs(yearA - yearB);
          if (yearDiff <= (yearProximity ?? DEFAULT_YEAR_PROXIMITY)) {
            return { isDuplicate: true, matchType: 'title' };
          }
        } else {
          // No years to compare, just use title similarity
          return { isDuplicate: true, matchType: 'title' };
        }
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Get source priority (lower = higher priority)
 */
function getSourcePriority(source: string, preferSource?: string[]): number {
  const priority = preferSource ?? [...DEFAULT_SOURCE_PRIORITY];
  const index = priority.indexOf(source);
  return index === -1 ? priority.length : index;
}

// ============================================================================
// Main Deduplication Function
// ============================================================================

/**
 * Deduplicate a batch of records
 *
 * @param records - Array of records to deduplicate
 * @param options - Deduplication options
 * @returns Deduplication result with unique records and statistics
 */
export function dedupeRecords(
  records: Record<string, unknown>[],
  options?: DedupeOptions
): DedupeResult {
  if (!records || records.length === 0) {
    return {
      unique: [],
      duplicates: [],
      stats: createEmptyDedupeStats(),
    };
  }

  const opts = { ...createDefaultDedupeOptions(), ...options };
  const { preferSource } = opts;

  // Track unique records and duplicates
  const unique: Record<string, unknown>[] = [];
  const duplicates: DuplicateInfo[] = [];
  const stats = createEmptyDedupeStats();

  stats.original = records.length;

  // Build URL index for O(1) lookup
  const urlIndex = new Map<string, number>();

  // Process each record
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const url = extractUrl(record);
    const source = extractSource(record);
    const recordId = extractId(record);

    let isDuplicate = false;
    let matchedWith = '';
    let matchType: DedupeMatchType = 'url';

    // Check URL match first (O(1) lookup)
    if (url && (opts.strategy === 'url' || opts.strategy === 'both')) {
      const normUrl = normaliseUrl(url);
      const existingIdx = urlIndex.get(normUrl);

      if (existingIdx !== undefined) {
        const existingRecord = unique[existingIdx];
        const existingSource = extractSource(existingRecord);

        // Check if we should keep the new record instead (higher priority source)
        const existingPriority = getSourcePriority(existingSource, preferSource);
        const newPriority = getSourcePriority(source, preferSource);

        if (newPriority < existingPriority) {
          // New record has higher priority, replace existing
          const replaced = unique[existingIdx];
          unique[existingIdx] = record;

          // Add replaced record to duplicates
          duplicates.push({
            record: replaced,
            matchedWith: recordId,
            matchType: 'url',
          });
          stats.byMatchType.url++;

          // Update URL index
          urlIndex.set(normUrl, existingIdx);
        } else {
          // Existing record has higher priority, mark new as duplicate
          isDuplicate = true;
          matchedWith = extractId(existingRecord);
          matchType = 'url';
        }
      }
    }

    // Check title similarity if not already a duplicate
    if (!isDuplicate && (opts.strategy === 'title' || opts.strategy === 'both')) {
      for (let j = 0; j < unique.length; j++) {
        const existingRecord = unique[j];
        const { isDuplicate: isTitleDup, matchType: mt } = areDuplicates(
          record,
          existingRecord,
          { ...opts, strategy: 'title' }
        );

        if (isTitleDup) {
          const existingSource = extractSource(existingRecord);

          // Check if we should keep the new record instead (higher priority source)
          const existingPriority = getSourcePriority(existingSource, preferSource);
          const newPriority = getSourcePriority(source, preferSource);

          if (newPriority < existingPriority) {
            // New record has higher priority, replace existing
            const replaced = unique[j];
            unique[j] = record;

            // Update URL index if needed
            const newUrl = extractUrl(record);
            if (newUrl) {
              urlIndex.set(normaliseUrl(newUrl), j);
            }

            // Add replaced record to duplicates
            duplicates.push({
              record: replaced,
              matchedWith: recordId,
              matchType: mt ?? 'title',
            });
            stats.byMatchType.title++;
          } else {
            // Existing record has higher priority, mark new as duplicate
            isDuplicate = true;
            matchedWith = extractId(existingRecord);
            matchType = mt ?? 'title';
          }
          break;
        }
      }
    }

    if (isDuplicate) {
      duplicates.push({
        record,
        matchedWith,
        matchType,
      });

      if (matchType === 'url') {
        stats.byMatchType.url++;
      } else {
        stats.byMatchType.title++;
      }
    } else if (!unique.includes(record)) {
      // Add to unique list and URL index
      const idx = unique.length;
      unique.push(record);

      if (url) {
        urlIndex.set(normaliseUrl(url), idx);
      }
    }
  }

  stats.unique = unique.length;
  stats.removed = duplicates.length;

  return {
    unique,
    duplicates,
    stats,
  };
}
