/**
 * Query builder factory and exports
 * @module core/query/builders
 */

import type { QueryBuilder } from '../types.js';
import { troveBuilder } from './trove.js';
import { provBuilder } from './prov.js';
import { alaBuilder } from './ala.js';

/**
 * Available query builders by source name
 */
const BUILDERS: Record<string, QueryBuilder> = {
  trove: troveBuilder,
  prov: provBuilder,
  ala: alaBuilder,
};

/**
 * Get a query builder for a specific source
 *
 * @param source - Source name (trove, prov, ala)
 * @returns QueryBuilder or undefined if not supported
 */
export function getBuilder(source: string): QueryBuilder | undefined {
  return BUILDERS[source.toLowerCase()];
}

/**
 * Check if a source has a query builder
 *
 * @param source - Source name
 * @returns true if source has a query builder
 */
export function hasBuilder(source: string): boolean {
  return source.toLowerCase() in BUILDERS;
}

/**
 * Get list of sources that support query building
 */
export function getSupportedSources(): string[] {
  return Object.keys(BUILDERS);
}

// Re-export builders for direct access
export { troveBuilder } from './trove.js';
export { provBuilder } from './prov.js';
export { alaBuilder } from './ala.js';
