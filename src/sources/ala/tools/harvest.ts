/**
 * ALA Harvest Tool - Bulk download occurrence records
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { alaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { ALA_KINGDOMS, AU_STATES_FULL } from '../../../core/enums.js';
import type { ALAOccurrence, ALAOccurrenceSearchParams } from '../types.js';

export const alaHarvestTool: SourceTool = {
  schema: {
    name: 'ala_harvest',
    description: 'Bulk download species occurrence records.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        scientificName: { type: 'string', description: PARAMS.SCIENTIFIC_NAME },
        kingdom: { type: 'string', description: PARAMS.KINGDOM, enum: ALA_KINGDOMS },
        family: { type: 'string', description: PARAMS.FAMILY },
        stateProvince: { type: 'string', description: PARAMS.STATE_FULL, enum: AU_STATES_FULL },
        startYear: { type: 'number', description: PARAMS.YEAR_FROM },
        endYear: { type: 'number', description: PARAMS.YEAR_TO },
        hasImages: { type: 'boolean', description: PARAMS.HAS_IMAGES },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
        startFrom: { type: 'number', description: PARAMS.START_FROM, default: 0 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      scientificName?: string;
      kingdom?: string;
      family?: string;
      stateProvince?: string;
      startYear?: number;
      endYear?: number;
      hasImages?: boolean;
      maxRecords?: number;
      startFrom?: number;
    };

    // Validate at least one filter
    const hasFilter = input.query || input.scientificName || input.kingdom ||
      input.family || input.stateProvince;

    if (!hasFilter) {
      return errorResponse('At least one filter parameter is required');
    }

    try {
      const maxRecords = Math.min(input.maxRecords ?? 100, 1000);
      const startFrom = input.startFrom ?? 0;

      // Build query description for response
      const queryDesc = [
        input.query && `query="${input.query}"`,
        input.scientificName && `species=${input.scientificName}`,
        input.kingdom && `kingdom=${input.kingdom}`,
        input.family && `family=${input.family}`,
        input.stateProvince && `state=${input.stateProvince}`,
      ].filter(Boolean).join(', ') || 'all records';

      const result = await runHarvest<ALAOccurrence>('ala', queryDesc, {
        maxRecords,
        batchSize: 100, // ALA max page size
        cursorMode: 'offset',
        initialCursor: startFrom,
        fetchBatch: async (offset, limit) => {
          const searchParams: ALAOccurrenceSearchParams = {
            q: input.query,
            scientificName: input.scientificName,
            kingdom: input.kingdom,
            family: input.family,
            stateProvince: input.stateProvince,
            startYear: input.startYear,
            endYear: input.endYear,
            hasImages: input.hasImages,
            pageSize: limit,
            startIndex: offset as number,
          };

          const searchResult = await alaClient.searchOccurrences(searchParams);

          return {
            records: searchResult.occurrences,
            total: searchResult.totalRecords,
            hasMore: (offset as number) + searchResult.occurrences.length < searchResult.totalRecords,
          };
        },
      });

      return successResponse({
        source: 'ala',
        harvested: result.totalHarvested,
        totalAvailable: result.totalAvailable,
        hasMore: result.hasMore,
        nextOffset: result.nextCursor,
        records: result.records.map((occ) => ({
          uuid: occ.uuid,
          scientificName: occ.scientificName,
          vernacularName: occ.vernacularName,
          kingdom: occ.kingdom,
          family: occ.family,
          state: occ.stateProvince,
          latitude: occ.decimalLatitude,
          longitude: occ.decimalLongitude,
          year: occ.year,
          hasImage: !!occ.imageUrl,
          dataSource: occ.dataResourceName,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
