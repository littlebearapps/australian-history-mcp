/**
 * Core Module
 *
 * Exports all shared types, utilities, and base classes.
 */

// Types
export {
  type MCPToolResponse,
  type APIError,
  type HarvestConfig,
  type HarvestBatchResult,
  type HarvestResult,
  APIRequestError,
  successResponse,
  errorResponse,
} from './types.js';

// Source interface
export {
  type Source,
  type SourceTool,
  createTool,
  defineSource,
} from './base-source.js';

// Base client
export { BaseClient, type FetchOptions } from './base-client.js';

// Harvest runner
export { runHarvest, formatPaginationInfo } from './harvest-runner.js';

// Faceted search
export {
  type FacetValue,
  type Facet,
  type FacetsResponse,
  type FacetableSearchInput,
  type FacetFieldConfig,
  type SourceFacetConfig,
  type CountFacetsInput,
  countFacets,
  mergeFacets,
  simpleFacetConfig,
  yearToDecade,
  countByDecade,
} from './facets/index.js';
