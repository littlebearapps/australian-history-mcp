/**
 * Compressor Module
 *
 * Phase 3: Reduce token usage by extracting only essential fields
 * from search results based on compression level.
 *
 * Token targets:
 * - minimal: ~20 tokens per record (id, url, source)
 * - standard: ~50 tokens per record (+ title, year)
 * - full: ~80 tokens per record (+ type, creator)
 */

import type {
  CompressionLevel,
  CompressedRecord,
  CompressionOptions,
  CompressionResult,
} from './types.js';
import {
  DEFAULT_MAX_TITLE_LENGTH,
  createDefaultCompressionOptions,
  createEmptyCompressionResult,
} from './types.js';

// ============================================================================
// Token Estimation
// ============================================================================

/**
 * Estimate the number of tokens for a data structure
 *
 * Uses a simple heuristic: ~4 characters per token for English text,
 * plus JSON structure overhead.
 *
 * @param data - Any data structure (will be JSON stringified)
 * @returns Estimated token count
 */
export function estimateTokens(data: unknown): number {
  if (data === null || data === undefined) {
    return 0;
  }

  const json = JSON.stringify(data);
  // ~4 chars per token on average for English text + JSON
  return Math.ceil(json.length / 4);
}

// ============================================================================
// Title Processing
// ============================================================================

/**
 * Truncate a title at a word boundary
 *
 * Preserves word boundaries to avoid cutting mid-word.
 * Adds ellipsis if truncated.
 *
 * @param title - Original title
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated title
 */
export function truncateTitle(
  title: string,
  maxLength: number = DEFAULT_MAX_TITLE_LENGTH
): string {
  if (!title) return '';

  // Clean up whitespace
  const cleaned = title.trim().replace(/\s+/g, ' ');

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Find last space within maxLength
  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.5) {
    // Found a reasonable word boundary
    return truncated.slice(0, lastSpace) + '...';
  }

  // No good word boundary, just truncate
  return truncated.slice(0, maxLength - 3) + '...';
}

// ============================================================================
// Year Extraction
// ============================================================================

/**
 * Extract year from various date formats in a record
 *
 * Handles:
 * - Direct year field: { year: 1920 }
 * - ISO date: { date: "1920-05-12" }
 * - Year string: { dateCreated: "1920" }
 * - Decade: { period: "1920s" }
 * - In title: { title: "Report 1920" }
 *
 * @param record - Record with potential date fields
 * @returns Extracted year or undefined
 */
export function extractYear(record: Record<string, unknown>): number | undefined {
  // Direct year field (number or string)
  if (record.year !== undefined) {
    const year = typeof record.year === 'number'
      ? record.year
      : parseInt(String(record.year), 10);
    if (isValidYear(year)) return year;
  }

  // Common date field names
  const dateFields = [
    'date',
    'dateCreated',
    'datePublished',
    'dateIssued',
    'created',
    'published',
    'issued',
    'startDate',
    'period',
    'era',
  ];

  for (const field of dateFields) {
    const value = record[field];
    if (typeof value === 'string') {
      const year = extractYearFromString(value);
      if (year) return year;
    }
  }

  // Try title as last resort
  const title = record.title ?? record.name ?? record.heading;
  if (typeof title === 'string') {
    const year = extractYearFromString(title);
    if (year) return year;
  }

  return undefined;
}

/**
 * Extract a year from a string
 */
function extractYearFromString(value: string): number | undefined {
  // ISO date format: 1920-05-12
  const isoMatch = value.match(/^(\d{4})-\d{2}-\d{2}/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    if (isValidYear(year)) return year;
  }

  // Year only: 1920
  const yearOnlyMatch = value.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    const year = parseInt(yearOnlyMatch[1], 10);
    if (isValidYear(year)) return year;
  }

  // Decade: 1920s
  const decadeMatch = value.match(/(\d{4})s/);
  if (decadeMatch) {
    const year = parseInt(decadeMatch[1], 10);
    if (isValidYear(year)) return year;
  }

  // Any 4-digit year in the string
  const anyYearMatch = value.match(/\b(1[789]\d{2}|20[0-2]\d)\b/);
  if (anyYearMatch) {
    const year = parseInt(anyYearMatch[1], 10);
    if (isValidYear(year)) return year;
  }

  return undefined;
}

/**
 * Check if a year is valid (1700-2030 range)
 */
function isValidYear(year: number): boolean {
  return !isNaN(year) && year >= 1700 && year <= 2030;
}

// ============================================================================
// Field Extraction
// ============================================================================

/**
 * Extract ID from a record
 */
function extractId(record: Record<string, unknown>, source: string): string {
  const idFields = ['id', 'recordId', 'workId', 'articleId', 'objectId', 'placeId'];

  for (const field of idFields) {
    if (record[field] !== undefined && record[field] !== null) {
      return String(record[field]);
    }
  }

  // Source-specific ID extraction
  switch (source) {
    case 'trove': {
      const work = record.work as Record<string, unknown> | undefined;
      const article = record.article as Record<string, unknown> | undefined;
      if (work?.id) return String(work.id);
      if (article?.id) return String(article.id);
      break;
    }
    case 'prov':
      if (record.record_id) return String(record.record_id);
      break;
    case 'nma': {
      const data = record.data as Record<string, unknown> | undefined;
      if (data?.id) return String(data.id);
      break;
    }
  }

  // Generate fallback ID
  return `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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
 * Extract type from a record
 */
function extractType(record: Record<string, unknown>): string | undefined {
  const typeFields = ['type', 'recordType', 'category', 'format', 'mediaType'];

  for (const field of typeFields) {
    const value = record[field];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

/**
 * Extract creator from a record
 */
function extractCreator(record: Record<string, unknown>): string | undefined {
  const creatorFields = ['creator', 'author', 'artist', 'contributor', 'photographer'];

  for (const field of creatorFields) {
    const value = record[field];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
    // Handle array of creators
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object' && first !== null) {
        const name = (first as Record<string, unknown>).name;
        if (typeof name === 'string') return name;
      }
    }
  }

  return undefined;
}

// ============================================================================
// Compression Functions
// ============================================================================

/**
 * Compress a single record to the specified level
 *
 * @param record - Original record with any structure
 * @param source - Source data provider name
 * @param level - Compression level
 * @param maxTitleLength - Maximum title length for truncation
 * @returns Compressed record
 */
export function compressRecord(
  record: Record<string, unknown>,
  source: string,
  level: CompressionLevel,
  maxTitleLength: number = DEFAULT_MAX_TITLE_LENGTH
): CompressedRecord {
  const compressed: CompressedRecord = {
    id: extractId(record, source),
    source,
  };

  // Always include URL if available
  const url = extractUrl(record);
  if (url) {
    compressed.url = url;
  }

  // Standard level: add title and year
  if (level === 'standard' || level === 'full') {
    const title = extractTitle(record);
    if (title) {
      compressed.title = truncateTitle(title, maxTitleLength);
    }

    const year = extractYear(record);
    if (year) {
      compressed.year = year;
    }
  }

  // Full level: add type and creator
  if (level === 'full') {
    const type = extractType(record);
    if (type) {
      compressed.type = type;
    }

    const creator = extractCreator(record);
    if (creator) {
      compressed.creator = truncateTitle(creator, maxTitleLength);
    }
  }

  return compressed;
}

/**
 * Compress multiple records with statistics
 *
 * @param records - Array of records to compress
 * @param options - Compression options
 * @returns Compression result with statistics
 */
export function compressRecords(
  records: Array<{ record: Record<string, unknown>; source: string }>,
  options?: Partial<CompressionOptions>
): CompressionResult {
  if (!records || records.length === 0) {
    return createEmptyCompressionResult();
  }

  const opts = { ...createDefaultCompressionOptions(), ...options };
  const { level, maxTitleLength } = opts;

  // Calculate original tokens
  const originalTokens = estimateTokens(records.map((r) => r.record));

  // Compress each record
  const compressed: CompressedRecord[] = records.map(({ record, source }) =>
    compressRecord(record, source, level, maxTitleLength)
  );

  // Calculate compressed tokens
  const compressedTokens = estimateTokens(compressed);

  // Calculate savings
  const tokenReduction = originalTokens - compressedTokens;
  const percentageSaved =
    originalTokens > 0 ? Math.round((tokenReduction / originalTokens) * 100) : 0;

  return {
    original: {
      count: records.length,
      estimatedTokens: originalTokens,
    },
    compressed: {
      count: compressed.length,
      estimatedTokens: compressedTokens,
      records: compressed,
    },
    savings: {
      recordsRemoved: 0, // No deduplication in this function
      tokenReduction,
      percentageSaved,
    },
  };
}

/**
 * Convenience function to compress an array of records with inferred source
 *
 * @param records - Array of records (must have source field)
 * @param options - Compression options
 * @returns Compression result
 */
export function compressRecordArray(
  records: Record<string, unknown>[],
  options?: Partial<CompressionOptions>
): CompressionResult {
  const withSource = records.map((record) => ({
    record,
    source: String(record.source ?? record._source ?? 'unknown'),
  }));

  return compressRecords(withSource, options);
}
