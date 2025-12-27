/**
 * Trove Harvest Tool - Bulk download records from Trove
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { TROVE_CATEGORIES, AU_STATES_WITH_NATIONAL, SORT_ORDERS_DATE, type AUStateWithNational } from '../../../core/enums.js';
import type { TroveArticle, TroveWork } from '../types.js';

export const troveHarvestTool: SourceTool = {
  schema: {
    name: 'trove_harvest',
    description: 'Bulk download Trove records with pagination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        category: { type: 'string', description: PARAMS.CATEGORY, enum: TROVE_CATEGORIES, default: 'all' },
        state: { type: 'string', description: PARAMS.STATE, enum: AU_STATES_WITH_NATIONAL },
        dateFrom: { type: 'string', description: PARAMS.DATE_FROM },
        dateTo: { type: 'string', description: PARAMS.DATE_TO },
        format: { type: 'string', description: PARAMS.FORMAT },
        includeFullText: { type: 'boolean', description: PARAMS.INCLUDE_FULL_TEXT, default: false },
        nuc: { type: 'string', description: PARAMS.NUC },
        sortby: { type: 'string', description: PARAMS.SORT_BY, enum: SORT_ORDERS_DATE, default: 'relevance' },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
        cursor: { type: 'string', description: PARAMS.CURSOR },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query: string;
      category?: string;
      state?: string;
      dateFrom?: string;
      dateTo?: string;
      format?: string;
      includeFullText?: boolean;
      nuc?: string;
      sortby?: 'relevance' | 'datedesc' | 'dateasc';
      maxRecords?: number;
      cursor?: string;
    };

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured. See CLAUDE.md for setup instructions.');
    }

    try {
      const maxRecords = Math.min(input.maxRecords ?? 100, 1000);

      // Build query description for response
      const queryDesc = [
        `query="${input.query}"`,
        input.category && `category=${input.category}`,
        input.state && `state=${input.state}`,
        input.nuc && `nuc=${input.nuc}`,
        input.sortby && input.sortby !== 'relevance' && `sortby=${input.sortby}`,
      ].filter(Boolean).join(', ');

      const result = await runHarvest<TroveArticle | TroveWork>('trove', queryDesc, {
        maxRecords,
        batchSize: 100, // Trove max per request
        cursorMode: 'cursor',
        initialCursor: input.cursor,
        fetchBatch: async (cursor, limit) => {
          const searchResult = await troveClient.search({
            query: input.query,
            category: input.category as typeof TROVE_CATEGORIES[number],
            state: input.state as AUStateWithNational,
            dateFrom: input.dateFrom,
            dateTo: input.dateTo,
            format: input.format,
            includeFullText: input.includeFullText ?? false,
            nuc: input.nuc,
            sortby: input.sortby,
            bulkHarvest: true,
            limit,
            start: cursor as string | undefined,
          });

          return {
            records: searchResult.records,
            total: searchResult.totalResults,
            nextCursor: searchResult.nextStart,
            hasMore: !!searchResult.nextStart,
          };
        },
      });

      return successResponse({
        source: 'trove',
        harvested: result.totalHarvested,
        totalAvailable: result.totalAvailable,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        records: result.records,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
