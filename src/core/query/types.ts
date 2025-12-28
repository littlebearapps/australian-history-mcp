/**
 * Query parsing types for advanced search syntax
 * @module core/query/types
 */

/**
 * Result of parsing a query string for advanced syntax
 */
export interface ParsedQuery {
  /** Original query string as provided */
  original: string;

  /** Query with extracted patterns removed */
  cleanedQuery: string;

  /** Extracted date range (from parsed patterns or decade) */
  dateRange?: DateRange;

  /** Field:value pairs extracted from query */
  fields: Record<string, string>;

  /** Quoted phrases found in query */
  phrases: string[];

  /** Exclusion terms (prefixed with -) */
  exclusions: string[];

  /** Whether query contains wildcard (*) patterns */
  hasWildcard: boolean;

  /** Detected decade (e.g., "1920s" -> { decade: 1920 }) */
  decade?: number;
}

/**
 * Date range with from/to years
 */
export interface DateRange {
  from: string;
  to: string;
}

/**
 * Result of transforming a parsed query for a specific source
 */
export interface TransformedQuery {
  /** Original query string */
  original: string;

  /** Query transformed for source-specific syntax */
  transformed: string;

  /** Fields that were applied to the query */
  appliedFields: Record<string, string>;

  /** Date range applied (if any) */
  appliedDateRange?: DateRange;

  /** Warnings about invalid or unsupported syntax */
  warnings?: string[];
}

/**
 * Common search arguments passed to builders
 */
export interface CommonSearchArgs {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  state?: string;
  limit?: number;
  sortby?: string;
  [key: string]: unknown;
}

/**
 * Query builder interface for source-specific transformations
 */
export interface QueryBuilder {
  /** Transform parsed query to source-specific syntax */
  build(parsed: ParsedQuery, args: CommonSearchArgs): TransformedQuery;

  /** Escape special characters for the source's query syntax */
  escape(value: string): string;

  /** Get list of valid field names for this source */
  getValidFields(): string[];

  /** Source name this builder handles */
  readonly source: string;
}
