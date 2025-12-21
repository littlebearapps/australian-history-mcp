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
