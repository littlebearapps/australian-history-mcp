/**
 * Faceted Search Types
 *
 * Shared type definitions for faceted search across all sources.
 * Supports both native API facets and client-side counting.
 */

// ============================================================================
// Facet Value Types
// ============================================================================

/**
 * Single facet value with count
 */
export interface FacetValue {
  /** The raw value (e.g., "1920", "Victoria", "Photograph") */
  value: string;
  /** Number of records with this value */
  count: number;
  /** Human-readable label if different from value */
  label?: string;
}

/**
 * A facet dimension with all its values
 */
export interface Facet {
  /** Internal name (e.g., "decade", "state") */
  name: string;
  /** Human-readable name (e.g., "Decade", "State/Territory") */
  displayName: string;
  /** All values with counts, sorted by count descending */
  values: FacetValue[];
  /** Sum of all counts (may differ from total results if multi-valued) */
  total?: number;
}

// ============================================================================
// Facet Response Types
// ============================================================================

/**
 * Facets response structure included in search results
 */
export interface FacetsResponse {
  /** Facets keyed by facet name */
  facets: Record<string, Facet>;
  /** Metadata about the facet request */
  _meta?: {
    /** Facets that were requested */
    requestedFacets?: string[];
    /** All facets available for this source */
    availableFacets?: string[];
    /** Whether facets are from native API or client-side counting */
    source?: 'native' | 'client';
  };
}

// ============================================================================
// Facet Input Types
// ============================================================================

/**
 * Mixin interface for search inputs that support faceting
 */
export interface FacetableSearchInput {
  /** Include facet counts in response */
  includeFacets?: boolean;
  /** Specific facets to return (defaults vary by source) */
  facetFields?: string[];
  /** Maximum values per facet (default 10) */
  facetLimit?: number;
}

// ============================================================================
// Facet Configuration Types
// ============================================================================

/**
 * Configuration for a single facet field
 */
export interface FacetFieldConfig {
  /** Internal name used in API/responses */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Path to value in record (e.g., "category", "taxonomy.kingdom") */
  fieldPath: string;
  /** Whether the source API supports this facet natively */
  nativeSupport: boolean;
  /** API parameter name if different from internal name */
  apiFieldName?: string;
}

/**
 * Source-level facet configuration
 */
export interface SourceFacetConfig {
  /** Source identifier */
  source: string;
  /** Available facets for this source */
  facets: FacetFieldConfig[];
  /** Default facets to return when facetFields not specified */
  defaultFacets: string[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Input for client-side facet counting
 */
export interface CountFacetsInput {
  /** Facet configurations to count */
  facetConfigs: FacetFieldConfig[];
  /** Specific facets to include (filters facetConfigs) */
  includeFacets?: string[];
  /** Maximum values per facet */
  limit?: number;
  /** Sort order for facet values */
  sortBy?: 'count' | 'alpha';
}
