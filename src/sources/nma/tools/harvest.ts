/**
 * NMA Harvest Tool - Bulk download museum collection objects
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { nmaClient } from '../client.js';
import type { NMAObject } from '../types.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const nmaHarvestTool: SourceTool = {
  schema: {
    name: 'nma_harvest',
    description: 'Bulk download museum collection objects.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        type: { type: 'string', description: PARAMS.TYPE },
        collection: { type: 'string', description: PARAMS.COLLECTION },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
        startFrom: { type: 'number', description: PARAMS.START_FROM, default: 0 },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      type?: string;
      collection?: string;
      maxRecords?: number;
      startFrom?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const maxRecords = Math.min(input.maxRecords ?? 100, 1000);
      const startFrom = input.startFrom ?? 0;

      const result = await runHarvest<NMAObject>('nma', `query="${input.query}"`, {
        maxRecords,
        batchSize: 100, // NMA max page size
        cursorMode: 'offset',
        initialCursor: startFrom,
        fetchBatch: async (offset, limit) => {
          const searchResult = await nmaClient.searchObjects({
            text: input.query,
            type: input.type,
            collection: input.collection,
            limit,
            offset: offset as number,
          });

          return {
            records: searchResult.data,
            total: searchResult.meta.results,
            hasMore: (offset as number) + searchResult.data.length < searchResult.meta.results,
          };
        },
      });

      return successResponse({
        source: 'nma',
        harvested: result.totalHarvested,
        totalAvailable: result.totalAvailable,
        hasMore: result.hasMore,
        nextOffset: result.nextCursor,
        records: result.records.map((obj) => ({
          id: obj.id,
          title: obj.title,
          type: obj.additionalType?.join(', '),
          collection: obj.collection?.title,
          identifier: obj.identifier,
          materials: obj.medium?.map((m) => m.title).join(', '),
          location: obj.spatial?.[0]?.title,
          licence: obj._meta?.licence,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
