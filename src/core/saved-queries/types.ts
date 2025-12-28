/**
 * Saved Queries Type Definitions
 *
 * SEARCH-019: Types for persistent named queries
 */

/**
 * A saved query with metadata
 */
export interface SavedQuery {
  /** Unique name (alphanumeric, hyphens, underscores) */
  name: string;

  /** Optional description */
  description?: string;

  /** Source name (e.g., 'prov', 'trove', 'federated') */
  source: string;

  /** Tool name to execute (e.g., 'prov_search', 'trove_search', or 'search' for federated) */
  tool: string;

  /** Query parameters to pass to the tool */
  parameters: Record<string, unknown>;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last execution timestamp (ISO 8601) */
  lastUsed?: string;

  /** Number of times this query has been executed */
  useCount: number;

  /** Tags for categorization */
  tags?: string[];
}

/**
 * Options for listing saved queries
 */
export interface ListQueryOptions {
  /** Filter by source name */
  source?: string;

  /** Filter by tool name */
  tool?: string;

  /** Filter by tag */
  tag?: string;

  /** Search in name and description */
  search?: string;

  /** Sort field */
  sortBy?: 'name' | 'createdAt' | 'lastUsed' | 'useCount';

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';

  /** Maximum results */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}

/**
 * Options for running a saved query
 */
export interface RunQueryOptions {
  /** Query name to run */
  name: string;

  /** Override specific parameters */
  overrides?: Record<string, unknown>;
}

/**
 * Stored queries file format
 */
export interface SavedQueriesFile {
  /** File format version */
  version: string;

  /** Map of query name to query */
  queries: Record<string, SavedQuery>;

  /** Last modified timestamp */
  lastModified: string;
}
