/**
 * PM Transcripts FTS5 Index Type Definitions
 *
 * SEARCH-018: Full-text search index for PM Transcripts
 */

/**
 * Index statistics
 */
export interface IndexStats {
  /** Total number of indexed transcripts */
  totalTranscripts: number;

  /** Number of unique Prime Ministers */
  uniquePrimeMinisters: number;

  /** Number of unique release types */
  uniqueReleaseTypes: number;

  /** Date range of indexed content */
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };

  /** Database file size in bytes */
  dbSizeBytes: number;

  /** Last index update time (ISO 8601) */
  lastUpdated: string | null;

  /** Index version for compatibility */
  indexVersion: string;
}

/**
 * A search result from the FTS5 index
 */
export interface IndexSearchResult {
  /** Transcript ID */
  transcriptId: number;

  /** Title with highlighted matches */
  title: string;

  /** Prime Minister name */
  primeMinister: string;

  /** Release type */
  releaseType: string;

  /** Release date (YYYY-MM-DD) */
  releaseDateIso: string;

  /** Subject tags */
  subjects: string[];

  /** Snippet with highlighted matches */
  snippet: string;

  /** BM25 relevance score (lower is better) */
  score: number;

  /** URL to original document */
  documentUrl: string | null;
}

/**
 * Search options for FTS5 queries
 */
export interface IndexSearchOptions {
  /** FTS5 search query (supports AND, OR, NOT, phrases, prefix*) */
  query: string;

  /** Filter by Prime Minister name (partial match) */
  primeMinister?: string;

  /** Filter by release type */
  releaseType?: string;

  /** Start date (YYYY-MM-DD) */
  dateFrom?: string;

  /** End date (YYYY-MM-DD) */
  dateTo?: string;

  /** Maximum results to return (default: 20, max: 100) */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}

/**
 * Progress update during index building
 */
export interface BuildProgress {
  /** Current phase */
  phase: 'fetching' | 'indexing' | 'optimizing' | 'complete' | 'error';

  /** Current transcript ID being processed */
  currentId?: number;

  /** Total transcripts to process */
  total?: number;

  /** Transcripts processed so far */
  processed?: number;

  /** Transcripts successfully indexed */
  indexed?: number;

  /** Transcripts skipped (not found or already indexed) */
  skipped?: number;

  /** Error message if phase is 'error' */
  error?: string;

  /** Estimated time remaining in seconds */
  estimatedSecondsRemaining?: number;
}

/**
 * Build mode for the index
 */
export type BuildMode = 'full' | 'update' | 'rebuild';

/**
 * Build options for index construction
 */
export interface BuildOptions {
  /** Build mode: full (first time), update (incremental), rebuild (drop and recreate) */
  mode: BuildMode;

  /** ID range to index (for large builds) */
  idRange?: {
    start: number;
    end: number;
  };

  /** Progress callback */
  onProgress?: (progress: BuildProgress) => void;

  /** Maximum transcripts to fetch per batch */
  batchSize?: number;
}

/**
 * Stored transcript record in SQLite
 */
export interface StoredTranscript {
  transcriptId: number;
  title: string;
  primeMinister: string;
  releaseType: string;
  releaseDateIso: string;
  subjects: string;
  content: string;
  documentUrl: string | null;
  contentHash: string;
}

/**
 * Index metadata stored in SQLite
 */
export interface IndexMetadata {
  key: string;
  value: string;
}
