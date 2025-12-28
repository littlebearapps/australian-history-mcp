/**
 * Facet Aggregator
 *
 * Utilities for client-side facet counting from search results.
 * Used by sources without native facet support.
 */

import type { Facet, FacetValue, FacetsResponse, FacetFieldConfig, CountFacetsInput } from './types.js';

// ============================================================================
// Core Counting Functions
// ============================================================================

/**
 * Get a value from a nested field path
 *
 * @example
 * getNestedValue({ taxonomy: { kingdom: "Animalia" } }, "taxonomy.kingdom")
 * // Returns "Animalia"
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Normalise a value to string for counting
 */
function normaliseValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    return value.trim() || null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

/**
 * Count occurrences of values for a single field across records
 */
function countField(
  records: Record<string, unknown>[],
  fieldPath: string,
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const record of records) {
    const value = getNestedValue(record, fieldPath);

    // Handle array fields (e.g., subjects, tags)
    if (Array.isArray(value)) {
      for (const item of value) {
        const normalised = normaliseValue(item);
        if (normalised !== null) {
          counts.set(normalised, (counts.get(normalised) || 0) + 1);
        }
      }
    } else {
      const normalised = normaliseValue(value);
      if (normalised !== null) {
        counts.set(normalised, (counts.get(normalised) || 0) + 1);
      }
    }
  }

  return counts;
}

/**
 * Convert counts map to sorted FacetValue array
 */
function countsToFacetValues(
  counts: Map<string, number>,
  limit: number,
  sortBy: 'count' | 'alpha',
): FacetValue[] {
  const values: FacetValue[] = Array.from(counts.entries()).map(([value, count]) => ({
    value,
    count,
  }));

  // Sort by count (descending) or alphabetically
  if (sortBy === 'alpha') {
    values.sort((a, b) => a.value.localeCompare(b.value));
  } else {
    values.sort((a, b) => b.count - a.count);
  }

  // Apply limit
  return values.slice(0, limit);
}

// ============================================================================
// Main Aggregation Functions
// ============================================================================

/**
 * Count facets from an array of records
 *
 * @param records - Array of record objects
 * @param input - Facet counting configuration
 * @returns FacetsResponse with counted facets
 *
 * @example
 * const facets = countFacets(records, {
 *   facetConfigs: [
 *     { name: 'category', displayName: 'Category', fieldPath: 'category', nativeSupport: false },
 *     { name: 'state', displayName: 'State', fieldPath: 'location.state', nativeSupport: false },
 *   ],
 *   includeFacets: ['category'],  // Only include category
 *   limit: 10,
 * });
 */
export function countFacets(
  records: Record<string, unknown>[],
  input: CountFacetsInput,
): FacetsResponse {
  const { facetConfigs, includeFacets, limit = 10, sortBy = 'count' } = input;

  // Filter to requested facets if specified
  const configsToCount = includeFacets
    ? facetConfigs.filter(c => includeFacets.includes(c.name))
    : facetConfigs;

  const facets: Record<string, Facet> = {};

  for (const config of configsToCount) {
    const counts = countField(records, config.fieldPath);
    const values = countsToFacetValues(counts, limit, sortBy);

    if (values.length > 0) {
      facets[config.name] = {
        name: config.name,
        displayName: config.displayName,
        values,
        total: values.reduce((sum, v) => sum + v.count, 0),
      };
    }
  }

  return {
    facets,
    _meta: {
      requestedFacets: includeFacets || configsToCount.map(c => c.name),
      availableFacets: facetConfigs.map(c => c.name),
      source: 'client',
    },
  };
}

/**
 * Merge facets from multiple pages/batches
 *
 * @param facetSets - Array of FacetsResponse objects to merge
 * @returns Combined FacetsResponse with merged counts
 */
export function mergeFacets(facetSets: FacetsResponse[]): FacetsResponse {
  if (facetSets.length === 0) {
    return { facets: {} };
  }

  if (facetSets.length === 1) {
    return facetSets[0];
  }

  const merged: Record<string, Map<string, FacetValue>> = {};
  const allFacetNames = new Set<string>();

  // Collect all facet values across all sets
  for (const set of facetSets) {
    for (const [facetName, facet] of Object.entries(set.facets)) {
      allFacetNames.add(facetName);

      if (!merged[facetName]) {
        merged[facetName] = new Map();
      }

      for (const value of facet.values) {
        const existing = merged[facetName].get(value.value);
        if (existing) {
          existing.count += value.count;
        } else {
          merged[facetName].set(value.value, { ...value });
        }
      }
    }
  }

  // Convert back to Facet objects
  const facets: Record<string, Facet> = {};

  for (const facetName of allFacetNames) {
    const valueMap = merged[facetName];
    if (valueMap && valueMap.size > 0) {
      const values = Array.from(valueMap.values())
        .sort((a, b) => b.count - a.count);

      // Get display name from first set that has this facet
      let displayName = facetName;
      for (const set of facetSets) {
        if (set.facets[facetName]) {
          displayName = set.facets[facetName].displayName;
          break;
        }
      }

      facets[facetName] = {
        name: facetName,
        displayName,
        values,
        total: values.reduce((sum, v) => sum + v.count, 0),
      };
    }
  }

  return {
    facets,
    _meta: {
      source: 'client',
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a simple facet config for common use cases
 */
export function simpleFacetConfig(
  name: string,
  displayName: string,
  fieldPath?: string,
): FacetFieldConfig {
  return {
    name,
    displayName,
    fieldPath: fieldPath || name,
    nativeSupport: false,
  };
}

/**
 * Convert decade year to decade label
 *
 * @example
 * yearToDecade(1923) // Returns { value: "1920", label: "1920s" }
 */
export function yearToDecade(year: number): FacetValue {
  const decade = Math.floor(year / 10) * 10;
  return {
    value: String(decade),
    count: 1,
    label: `${decade}s`,
  };
}

/**
 * Group records by decade from a date field
 */
export function countByDecade(
  records: Record<string, unknown>[],
  dateFieldPath: string,
): FacetValue[] {
  const counts = new Map<string, number>();

  for (const record of records) {
    const dateValue = getNestedValue(record, dateFieldPath);
    if (typeof dateValue === 'string' && dateValue.length >= 4) {
      const year = parseInt(dateValue.substring(0, 4), 10);
      if (!isNaN(year) && year > 1800 && year < 2100) {
        const decade = String(Math.floor(year / 10) * 10);
        counts.set(decade, (counts.get(decade) || 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      count,
      label: `${value}s`,
    }))
    .sort((a, b) => b.count - a.count);
}
