/**
 * Core Type Definitions
 *
 * Base types shared across all sources. Source-specific types
 * live in their respective source directories.
 */

// ============================================================================
// MCP Response Types
// ============================================================================

/**
 * Standard MCP tool response format
 */
export interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  [key: string]: unknown;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Standardised API error format
 */
export interface APIError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
}

/**
 * Error class for API failures
 */
export class APIRequestError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  readonly retryable: boolean;

  constructor(message: string, code: string, statusCode?: number, retryable = false) {
    super(message);
    this.name = 'APIRequestError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

// ============================================================================
// Harvest Types
// ============================================================================

/**
 * Configuration for harvest/pagination operations
 */
export interface HarvestConfig<T> {
  /** Maximum records to harvest */
  maxRecords: number;
  /** Records per batch */
  batchSize: number;
  /** Pagination mode */
  cursorMode: 'offset' | 'cursor' | 'page';
  /** Initial cursor/offset value */
  initialCursor?: string | number;
  /** Function to fetch a batch of records */
  fetchBatch: (cursor: string | number, limit: number) => Promise<HarvestBatchResult<T>>;
}

/**
 * Result from a single batch fetch
 */
export interface HarvestBatchResult<T> {
  records: T[];
  total: number;
  nextCursor?: string | number;
  hasMore: boolean;
}

/**
 * Final harvest result
 */
export interface HarvestResult<T> {
  source: string;
  query: string;
  totalHarvested: number;
  totalAvailable: number;
  records: T[];
  nextCursor?: string | number;
  hasMore: boolean;
}

// ============================================================================
// Response Builders
// ============================================================================

/**
 * Create a successful MCP response
 */
export function successResponse(data: unknown): MCPToolResponse {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(data, null, 2),
    }],
  };
}

/**
 * Create an error MCP response
 */
export function errorResponse(error: unknown, toolName?: string): MCPToolResponse {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        error: message,
        ...(toolName && { tool: toolName }),
      }),
    }],
    isError: true,
  };
}
