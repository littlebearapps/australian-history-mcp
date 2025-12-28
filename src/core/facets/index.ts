/**
 * Faceted Search Module
 *
 * Provides shared types and utilities for faceted search across all sources.
 *
 * Usage:
 * ```typescript
 * import { countFacets, simpleFacetConfig, FacetsResponse } from '../core/facets/index.js';
 *
 * // Count facets from search results
 * const facets = countFacets(records, {
 *   facetConfigs: [
 *     simpleFacetConfig('category', 'Category'),
 *     simpleFacetConfig('state', 'State', 'location.state'),
 *   ],
 *   limit: 10,
 * });
 * ```
 */

// Export types
export type {
  FacetValue,
  Facet,
  FacetsResponse,
  FacetableSearchInput,
  FacetFieldConfig,
  SourceFacetConfig,
  CountFacetsInput,
} from './types.js';

// Export aggregation functions
export {
  countFacets,
  mergeFacets,
  simpleFacetConfig,
  yearToDecade,
  countByDecade,
} from './aggregator.js';
