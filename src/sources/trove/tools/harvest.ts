/**
 * Trove Harvest Tool - Bulk download records from Trove
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { troveClient } from '../client.js';
import { TROVE_CATEGORIES, TROVE_STATES, type TroveArticle, type TroveWork } from '../types.js';

export const troveHarvestTool: SourceTool = {
  schema: {
    name: 'trove_harvest',
    description: 'Bulk download Trove records with cursor-based pagination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search terms',
        },
        category: {
          type: 'string',
          enum: TROVE_CATEGORIES,
          description: 'Content category',
          default: 'all',
        },
        state: {
          type: 'string',
          enum: TROVE_STATES,
          description: 'Filter by state (newspapers)',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date (YYYY)',
        },
        dateTo: {
          type: 'string',
          description: 'End date (YYYY)',
        },
        format: {
          type: 'string',
          description: 'Format filter',
        },
        includeFullText: {
          type: 'boolean',
          description: 'Include article text (newspapers only)',
          default: false,
        },
        nuc: {
          type: 'string',
          description: 'NUC code to filter by contributor/partner. Common codes: VSL (State Library Victoria), SLNSW (State Library NSW), ANL (National Library), QSL (State Library Queensland)',
        },
        maxRecords: {
          type: 'number',
          description: 'Maximum records to harvest (1-1000)',
          default: 100,
        },
        cursor: {
          type: 'string',
          description: 'Pagination cursor from previous harvest',
        },
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
            state: input.state as typeof TROVE_STATES[number],
            dateFrom: input.dateFrom,
            dateTo: input.dateTo,
            format: input.format,
            includeFullText: input.includeFullText ?? false,
            nuc: input.nuc,
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
