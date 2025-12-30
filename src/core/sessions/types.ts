/**
 * Session Management Type Definitions
 *
 * Phase 2: Types for research session tracking, query logging,
 * result fingerprinting, and source coverage.
 */

/**
 * Session lifecycle status
 */
export type SessionStatus = 'active' | 'paused' | 'completed' | 'archived';

/**
 * All data sources tracked for coverage
 */
export const ALL_SOURCES = [
  'prov',
  'trove',
  'ghap',
  'museums-victoria',
  'ala',
  'nma',
  'vhd',
  'acmi',
  'pm-transcripts',
  'iiif',
  'ga-hap',
] as const;

export type SourceName = (typeof ALL_SOURCES)[number];

/**
 * A single query executed within a session
 */
export interface SessionQuery {
  /** Unique query ID (UUID) */
  id: string;

  /** Execution timestamp (ISO 8601) */
  timestamp: string;

  /** Meta-tool used (search, run, etc.) */
  tool: string;

  /** Data sources queried */
  sources: string[];

  /** Search query text */
  query: string;

  /** Applied filters and parameters */
  filters: Record<string, unknown>;

  /** Total results before deduplication */
  resultCount: number;

  /** Unique results after deduplication */
  uniqueCount: number;

  /** Duplicates removed in this query */
  duplicatesRemoved: number;

  /** Execution duration in milliseconds */
  durationMs: number;
}

/**
 * Result fingerprint for deduplication
 */
export interface ResultFingerprint {
  /** Unique fingerprint ID (hash-based) */
  id: string;

  /** Data source that returned this result */
  source: string;

  /** Normalised URL (if available) */
  url?: string;

  /** Hash of normalised title */
  titleHash: string;

  /** First seen timestamp (ISO 8601) */
  firstSeen: string;

  /** Query ID that first found this result */
  queryId: string;
}

/**
 * Source coverage status for a session
 */
export interface SourceCoverage {
  /** Source name */
  source: string;

  /** Coverage status */
  status: 'not_searched' | 'searched' | 'partial' | 'failed';

  /** Number of queries executed against this source */
  queriesExecuted: number;

  /** Total results found from this source */
  resultsFound: number;

  /** Last search timestamp (ISO 8601) */
  lastSearched?: string;

  /** Error messages if any */
  errors?: string[];
}

/**
 * Session statistics summary
 */
export interface SessionStats {
  /** Total queries executed */
  totalQueries: number;

  /** Total results across all queries */
  totalResults: number;

  /** Unique results after deduplication */
  uniqueResults: number;

  /** Total duplicates removed */
  duplicatesRemoved: number;

  /** Number of sources searched at least once */
  sourcesSearched: number;
}

/**
 * Research session object
 */
export interface Session {
  /** Unique session ID (UUID) */
  id: string;

  /** User-provided name (alphanumeric, hyphens, underscores) */
  name: string;

  /** Research topic description */
  topic: string;

  /** Current session status */
  status: SessionStatus;

  /** Link to plan_search session ID (if created from plan) */
  planId?: string;

  /** Path to plan.md file (if saved) */
  planPath?: string;

  /** Creation timestamp (ISO 8601) */
  created: string;

  /** Last update timestamp (ISO 8601) */
  updated: string;

  /** All queries executed in this session */
  queries: SessionQuery[];

  /** All unique result fingerprints */
  fingerprints: ResultFingerprint[];

  /** Coverage status per source */
  coverage: SourceCoverage[];

  /** User notes attached to session */
  notes: string[];

  /** Aggregate statistics */
  stats: SessionStats;
}

/**
 * Persistent session store file format
 */
export interface SessionStoreFile {
  /** Storage format version */
  version: number;

  /** Currently active session ID (only one active at a time) */
  activeSessionId?: string;

  /** All sessions */
  sessions: Session[];

  /** Last modified timestamp (ISO 8601) */
  lastModified: string;
}

/**
 * Options for listing sessions
 */
export interface ListSessionOptions {
  /** Filter by status */
  status?: SessionStatus;

  /** Search in topic text */
  topic?: string;

  /** Maximum results */
  limit?: number;

  /** Include archived sessions */
  includeArchived?: boolean;
}

/**
 * Options for exporting sessions
 */
export interface ExportSessionOptions {
  /** Session ID (defaults to active) */
  id?: string;

  /** Export format */
  format: 'json' | 'markdown' | 'csv';

  /** What to include in export */
  include?: ('queries' | 'results' | 'coverage' | 'all')[];

  /** Output file path (returns content if not provided) */
  path?: string;
}

/**
 * Duplicate detection result
 */
export interface DuplicateCheckResult {
  /** Whether this result is a duplicate */
  isDuplicate: boolean;

  /** ID of the matched fingerprint (if duplicate) */
  matchedId?: string;

  /** How the duplicate was detected */
  matchType?: 'url' | 'title' | 'id';
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid SessionStatus
 */
export function isSessionStatus(value: unknown): value is SessionStatus {
  return (
    typeof value === 'string' &&
    ['active', 'paused', 'completed', 'archived'].includes(value)
  );
}

/**
 * Check if a value is a valid SourceName
 */
export function isSourceName(value: unknown): value is SourceName {
  return typeof value === 'string' && ALL_SOURCES.includes(value as SourceName);
}

/**
 * Check if a session name is valid (alphanumeric, hyphens, underscores, max 64 chars)
 */
export function isValidSessionName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name);
}

/**
 * Check if a value is a valid Session object (basic structure check)
 */
export function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.topic === 'string' &&
    isSessionStatus(obj.status) &&
    typeof obj.created === 'string' &&
    typeof obj.updated === 'string' &&
    Array.isArray(obj.queries) &&
    Array.isArray(obj.fingerprints) &&
    Array.isArray(obj.coverage) &&
    Array.isArray(obj.notes) &&
    typeof obj.stats === 'object'
  );
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create initial coverage array for all sources
 */
export function createInitialCoverage(): SourceCoverage[] {
  return ALL_SOURCES.map((source) => ({
    source,
    status: 'not_searched' as const,
    queriesExecuted: 0,
    resultsFound: 0,
  }));
}

/**
 * Create initial session stats
 */
export function createInitialStats(): SessionStats {
  return {
    totalQueries: 0,
    totalResults: 0,
    uniqueResults: 0,
    duplicatesRemoved: 0,
    sourcesSearched: 0,
  };
}

/**
 * Create an empty session store file
 */
export function createEmptyStoreFile(): SessionStoreFile {
  return {
    version: 1,
    sessions: [],
    lastModified: new Date().toISOString(),
  };
}
