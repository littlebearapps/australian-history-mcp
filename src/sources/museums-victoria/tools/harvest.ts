/**
 * Museums Victoria Harvest Tool - Bulk download records
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { museumsVictoriaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { MV_RECORD_TYPES, MV_CATEGORIES, MV_LICENCES } from '../../../core/enums.js';
import type { MuseumRecord, MuseumSearchParams } from '../types.js';

export const museumsvicHarvestTool: SourceTool = {
  schema: {
    name: 'museumsvic_harvest',
    description: 'Bulk download museum records.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        recordType: { type: 'string', description: PARAMS.RECORD_TYPE, enum: MV_RECORD_TYPES },
        category: { type: 'string', description: PARAMS.CATEGORY, enum: MV_CATEGORIES },
        hasImages: { type: 'boolean', description: PARAMS.HAS_IMAGES },
        imageLicence: { type: 'string', description: 'Image licence', enum: MV_LICENCES },
        locality: { type: 'string', description: 'Collection locality' },
        taxon: { type: 'string', description: PARAMS.TAXON },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
        startPage: { type: 'number', description: PARAMS.PAGE, default: 1 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      recordType?: string;
      category?: string;
      hasImages?: boolean;
      imageLicence?: string;
      locality?: string;
      taxon?: string;
      maxRecords?: number;
      startPage?: number;
    };

    // Validate at least one search criterion
    if (!input.query && !input.recordType && !input.category && !input.taxon && !input.locality) {
      return errorResponse('At least one search parameter is required');
    }

    try {
      const maxRecords = Math.min(input.maxRecords ?? 100, 1000);
      const startPage = input.startPage ?? 1;

      // Build query description for response
      const queryDesc = [
        input.query && `query="${input.query}"`,
        input.recordType && `type=${input.recordType}`,
        input.category && `category=${input.category}`,
      ].filter(Boolean).join(', ') || 'all records';

      const result = await runHarvest<MuseumRecord>('museumsvic', queryDesc, {
        maxRecords,
        batchSize: 100, // API max
        cursorMode: 'page',
        initialCursor: startPage,
        fetchBatch: async (page, limit) => {
          const searchParams: MuseumSearchParams = {
            query: input.query,
            recordType: input.recordType as MuseumSearchParams['recordType'],
            category: input.category as MuseumSearchParams['category'],
            hasImages: input.hasImages,
            imageLicence: input.imageLicence as MuseumSearchParams['imageLicence'],
            locality: input.locality,
            taxon: input.taxon,
            perPage: limit,
            page: page as number,
          };

          const searchResult = await museumsVictoriaClient.search(searchParams);

          return {
            records: searchResult.records,
            total: searchResult.totalResults,
            nextCursor: searchResult.nextPage,
            hasMore: !!searchResult.nextPage,
          };
        },
      });

      return successResponse({
        source: 'museumsvic',
        harvested: result.totalHarvested,
        totalAvailable: result.totalAvailable,
        hasMore: result.hasMore,
        nextPage: result.nextCursor,
        records: result.records.map(r => ({
          id: r.id,
          type: r.recordType,
          title: r.displayTitle,
          hasImages: (r.media?.length ?? 0) > 0,
          modified: r.dateModified,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
