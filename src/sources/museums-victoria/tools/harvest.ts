/**
 * Museums Victoria Harvest Tool - Bulk download records
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { museumsVictoriaClient } from '../client.js';
import type { MuseumRecord, MuseumSearchParams } from '../types.js';

export const museumsvicHarvestTool: SourceTool = {
  schema: {
    name: 'museumsvic_harvest',
    description: 'Bulk download Museums Victoria records with pagination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search terms',
        },
        recordType: {
          type: 'string',
          enum: ['article', 'item', 'species', 'specimen'],
          description: 'Type of record to harvest',
        },
        category: {
          type: 'string',
          enum: ['natural sciences', 'first peoples', 'history & technology'],
          description: 'Collection category',
        },
        hasImages: {
          type: 'boolean',
          description: 'Only harvest records with images',
        },
        imageLicence: {
          type: 'string',
          enum: ['public domain', 'cc by', 'cc by-nc', 'cc by-sa', 'cc by-nc-sa'],
          description: 'Filter by image licence',
        },
        locality: {
          type: 'string',
          description: 'Filter by collection locality',
        },
        taxon: {
          type: 'string',
          description: 'Filter by taxonomic classification',
        },
        maxRecords: {
          type: 'number',
          description: 'Maximum records to harvest (1-1000)',
          default: 100,
        },
        startPage: {
          type: 'number',
          description: 'Page to start from (for pagination)',
          default: 1,
        },
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
