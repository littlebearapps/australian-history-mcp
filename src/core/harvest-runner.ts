/**
 * Harvest Runner
 *
 * Shared pagination and batch harvesting logic used by all sources.
 * Eliminates duplicate harvest implementations across sources.
 */

import type { HarvestConfig, HarvestResult } from './types.js';

/**
 * Run a harvest operation with consistent pagination handling
 *
 * Supports three pagination modes:
 * - 'offset': Numeric offset (PROV, GHAP)
 * - 'cursor': String-based cursor (Trove)
 * - 'page': Page numbers (Museums Victoria)
 */
export async function runHarvest<T>(
  source: string,
  query: string,
  config: HarvestConfig<T>
): Promise<HarvestResult<T>> {
  const {
    maxRecords,
    batchSize,
    cursorMode,
    initialCursor,
    fetchBatch,
  } = config;

  const allRecords: T[] = [];
  let currentCursor: string | number = initialCursor ?? (cursorMode === 'cursor' ? '' : 0);
  let totalAvailable = 0;
  let hasMore = true;

  while (allRecords.length < maxRecords && hasMore) {
    const remaining = maxRecords - allRecords.length;
    const batchLimit = Math.min(batchSize, remaining);

    try {
      const batch = await fetchBatch(currentCursor, batchLimit);

      allRecords.push(...batch.records);
      totalAvailable = batch.total;
      hasMore = batch.hasMore;

      if (batch.nextCursor !== undefined) {
        currentCursor = batch.nextCursor;
      } else if (cursorMode === 'offset') {
        currentCursor = (currentCursor as number) + batch.records.length;
      } else if (cursorMode === 'page') {
        currentCursor = (currentCursor as number) + 1;
      } else {
        // No more pages
        hasMore = false;
      }

      // Stop if we got fewer records than requested (end of results)
      if (batch.records.length < batchLimit) {
        hasMore = false;
      }
    } catch (error) {
      // Return what we have so far on error
      console.error(`Harvest error after ${allRecords.length} records:`, error);
      return {
        source,
        query,
        totalHarvested: allRecords.length,
        totalAvailable,
        records: allRecords,
        nextCursor: currentCursor,
        hasMore: true, // Assume more available since we errored
      };
    }
  }

  return {
    source,
    query,
    totalHarvested: allRecords.length,
    totalAvailable,
    records: allRecords,
    nextCursor: hasMore ? currentCursor : undefined,
    hasMore: allRecords.length < totalAvailable,
  };
}

/**
 * Calculate pagination info for response formatting
 */
export function formatPaginationInfo(
  harvested: number,
  total: number,
  hasMore: boolean,
  nextCursor?: string | number
): {
  harvested: number;
  totalAvailable: number;
  hasMore: boolean;
  nextOffset?: string;
} {
  return {
    harvested,
    totalAvailable: total,
    hasMore,
    ...(hasMore && nextCursor !== undefined && { nextOffset: String(nextCursor) }),
  };
}
