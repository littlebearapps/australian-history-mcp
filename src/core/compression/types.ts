/**
 * Context Compression Type Definitions
 *
 * Phase 3: Types for result compression, deduplication,
 * URL extraction, and checkpoint management.
 */

// ============================================================================
// Compression Types
// ============================================================================

/**
 * Compression level determining which fields to include
 */
export type CompressionLevel = 'minimal' | 'standard' | 'full';

/**
 * Compressed record structure
 *
 * Fields included by level:
 * - minimal: id, url, source (~20 tokens)
 * - standard: + title, year (~50 tokens)
 * - full: + type, creator (~80 tokens)
 */
export interface CompressedRecord {
  /** Record identifier */
  id: string;

  /** Record URL (if available) */
  url?: string;

  /** Source data provider */
  source: string;

  /** Truncated title (standard+ level) */
  title?: string;

  /** Year from date fields (standard+ level) */
  year?: number;

  /** Record type (full level only) */
  type?: string;

  /** Creator/author (full level only) */
  creator?: string;
}

/**
 * Options for compressing records
 */
export interface CompressionOptions {
  /** Compression level */
  level: CompressionLevel;

  /** Maximum title length before truncation (default: 50) */
  maxTitleLength?: number;

  /** Include source field (default: true) */
  includeSource?: boolean;

  /** Deduplicate before compressing (default: true) */
  dedupeFirst?: boolean;
}

/**
 * Result of a compression operation
 */
export interface CompressionResult {
  /** Original data statistics */
  original: {
    /** Number of records before compression */
    count: number;
    /** Estimated tokens before compression */
    estimatedTokens: number;
  };

  /** Compressed data statistics */
  compressed: {
    /** Number of records after compression */
    count: number;
    /** Estimated tokens after compression */
    estimatedTokens: number;
    /** Compressed records */
    records: CompressedRecord[];
  };

  /** Savings achieved */
  savings: {
    /** Records removed (deduplication) */
    recordsRemoved: number;
    /** Token reduction (original - compressed) */
    tokenReduction: number;
    /** Percentage saved (0-100) */
    percentageSaved: number;
  };
}

// ============================================================================
// URL Extraction Types
// ============================================================================

/**
 * Single extracted URL with metadata
 */
export interface ExtractedUrl {
  /** The URL */
  url: string;

  /** Source data provider */
  source: string;

  /** Record title (if available) */
  title?: string;
}

/**
 * Result of URL extraction operation
 */
export interface UrlExtractionResult {
  /** Extracted URLs */
  urls: ExtractedUrl[];

  /** Total count */
  count: number;

  /** Estimated tokens for this result */
  estimatedTokens: number;
}

// ============================================================================
// Deduplication Types
// ============================================================================

/**
 * Strategy for detecting duplicates
 */
export type DedupeStrategy = 'url' | 'title' | 'both';

/**
 * How a duplicate was matched
 */
export type DedupeMatchType = 'url' | 'title';

/**
 * Options for deduplication
 */
export interface DedupeOptions {
  /** Matching strategy (default: 'both') */
  strategy?: DedupeStrategy;

  /** Jaccard similarity threshold for title matching (default: 0.85) */
  titleThreshold?: number;

  /** Year proximity for title matching (default: 2) */
  yearProximity?: number;

  /** Source priority order for keeping records */
  preferSource?: string[];
}

/**
 * Information about a duplicate record
 */
export interface DuplicateInfo {
  /** The duplicate record */
  record: Record<string, unknown>;

  /** ID of the record it matched with */
  matchedWith: string;

  /** How the duplicate was detected */
  matchType: DedupeMatchType;
}

/**
 * Result of a deduplication operation
 */
export interface DedupeResult {
  /** Unique records (kept) */
  unique: Record<string, unknown>[];

  /** Duplicate records (removed) */
  duplicates: DuplicateInfo[];

  /** Statistics */
  stats: {
    /** Original record count */
    original: number;
    /** Unique records kept */
    unique: number;
    /** Duplicates removed */
    removed: number;
    /** Breakdown by match type */
    byMatchType: {
      url: number;
      title: number;
    };
  };
}

// ============================================================================
// Checkpoint Types
// ============================================================================

/**
 * Checkpoint data payload
 */
export interface CheckpointData {
  /** Compressed records saved */
  records: CompressedRecord[];

  /** Fingerprint IDs for tracking duplicates */
  fingerprints: string[];

  /** Source coverage state at checkpoint time */
  coverage: Record<string, unknown>;
}

/**
 * A checkpoint snapshot
 */
export interface Checkpoint {
  /** Unique checkpoint ID (UUID) */
  id: string;

  /** User-provided name */
  name: string;

  /** Creation timestamp (ISO 8601) */
  created: string;

  /** Associated session ID (if any) */
  sessionId?: string;

  /** Checkpoint data */
  data: CheckpointData;
}

/**
 * Checkpoint summary (without full data)
 */
export interface CheckpointSummary {
  /** Unique checkpoint ID */
  id: string;

  /** User-provided name */
  name: string;

  /** Creation timestamp (ISO 8601) */
  created: string;

  /** Associated session ID (if any) */
  sessionId?: string;

  /** Number of records in checkpoint */
  recordCount: number;
}

/**
 * Persistent checkpoint store file format
 */
export interface CheckpointStoreFile {
  /** Storage format version */
  version: number;

  /** All checkpoints */
  checkpoints: Checkpoint[];

  /** Last modified timestamp (ISO 8601) */
  lastModified: string;
}

// ============================================================================
// Default Values
// ============================================================================

/** Default maximum title length for truncation */
export const DEFAULT_MAX_TITLE_LENGTH = 50;

/** Default Jaccard similarity threshold for same-source title matching */
export const SAME_SOURCE_THRESHOLD = 0.85;

/** Default Jaccard similarity threshold for cross-source title matching */
export const CROSS_SOURCE_THRESHOLD = 0.9;

/** Default year proximity for title matching */
export const DEFAULT_YEAR_PROXIMITY = 2;

/** Default source priority order */
export const DEFAULT_SOURCE_PRIORITY = [
  'trove',
  'prov',
  'nma',
  'museums-victoria',
  'vhd',
  'acmi',
  'ghap',
  'ala',
  'pm-transcripts',
  'iiif',
  'ga-hap',
] as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid CompressionLevel
 */
export function isCompressionLevel(value: unknown): value is CompressionLevel {
  return (
    typeof value === 'string' && ['minimal', 'standard', 'full'].includes(value)
  );
}

/**
 * Check if a value is a valid DedupeStrategy
 */
export function isDedupeStrategy(value: unknown): value is DedupeStrategy {
  return (
    typeof value === 'string' && ['url', 'title', 'both'].includes(value)
  );
}

/**
 * Check if a checkpoint name is valid (alphanumeric, hyphens, underscores, max 64 chars)
 */
export function isValidCheckpointName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name);
}

/**
 * Check if a value is a valid CompressedRecord
 */
export function isCompressedRecord(value: unknown): value is CompressedRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.source === 'string' &&
    (obj.url === undefined || typeof obj.url === 'string') &&
    (obj.title === undefined || typeof obj.title === 'string') &&
    (obj.year === undefined || typeof obj.year === 'number') &&
    (obj.type === undefined || typeof obj.type === 'string') &&
    (obj.creator === undefined || typeof obj.creator === 'string')
  );
}

/**
 * Check if a value is a valid Checkpoint
 */
export function isCheckpoint(value: unknown): value is Checkpoint {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.created === 'string' &&
    (obj.sessionId === undefined || typeof obj.sessionId === 'string') &&
    typeof obj.data === 'object' &&
    obj.data !== null
  );
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create default compression options
 */
export function createDefaultCompressionOptions(
  level: CompressionLevel = 'standard'
): CompressionOptions {
  return {
    level,
    maxTitleLength: DEFAULT_MAX_TITLE_LENGTH,
    includeSource: true,
    dedupeFirst: true,
  };
}

/**
 * Create default deduplication options
 */
export function createDefaultDedupeOptions(): DedupeOptions {
  return {
    strategy: 'both',
    titleThreshold: SAME_SOURCE_THRESHOLD,
    yearProximity: DEFAULT_YEAR_PROXIMITY,
    preferSource: [...DEFAULT_SOURCE_PRIORITY],
  };
}

/**
 * Create an empty checkpoint store file
 */
export function createEmptyCheckpointStoreFile(): CheckpointStoreFile {
  return {
    version: 1,
    checkpoints: [],
    lastModified: new Date().toISOString(),
  };
}

/**
 * Create empty deduplication statistics
 */
export function createEmptyDedupeStats(): DedupeResult['stats'] {
  return {
    original: 0,
    unique: 0,
    removed: 0,
    byMatchType: {
      url: 0,
      title: 0,
    },
  };
}

/**
 * Create empty compression result
 */
export function createEmptyCompressionResult(): CompressionResult {
  return {
    original: {
      count: 0,
      estimatedTokens: 0,
    },
    compressed: {
      count: 0,
      estimatedTokens: 0,
      records: [],
    },
    savings: {
      recordsRemoved: 0,
      tokenReduction: 0,
      percentageSaved: 0,
    },
  };
}
