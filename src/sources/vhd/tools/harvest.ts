/**
 * VHD Harvest Tool - Bulk download Victorian heritage records
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { vhdClient } from '../client.js';
import type { VHDPlace } from '../types.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const vhdHarvestTool: SourceTool = {
  schema: {
    name: 'vhd_harvest',
    description: 'Bulk download heritage place records.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        municipality: { type: 'string', description: PARAMS.MUNICIPALITY },
        architecturalStyle: { type: 'string', description: PARAMS.ARCH_STYLE },
        period: { type: 'string', description: PARAMS.PERIOD },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
        startPage: { type: 'number', description: PARAMS.START_PAGE, default: 1 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      municipality?: string;
      architecturalStyle?: string;
      period?: string;
      maxRecords?: number;
      startPage?: number;
    };

    try {
      const maxRecords = Math.min(input.maxRecords ?? 100, 1000);
      const startPage = input.startPage ?? 1;

      // Build query description
      const queryDesc = [
        input.query && `query="${input.query}"`,
        input.municipality && `municipality=${input.municipality}`,
        input.architecturalStyle && `style=${input.architecturalStyle}`,
        input.period && `period=${input.period}`,
      ].filter(Boolean).join(', ') || 'all places';

      const result = await runHarvest<VHDPlace>('vhd', queryDesc, {
        maxRecords,
        batchSize: 25, // VHD default page size (rpp)
        cursorMode: 'page',
        initialCursor: startPage,
        fetchBatch: async (page, limit) => {
          const searchResult = await vhdClient.searchPlaces({
            query: input.query,
            municipality: input.municipality,
            architecturalStyle: input.architecturalStyle,
            period: input.period,
            page: page as number,
            limit,
          });

          const places = searchResult._embedded?.places ?? [];
          const hasNext = !!searchResult._links?.next;

          // Estimate total from last page link if available
          let total = 0;
          if (searchResult._links?.last) {
            const lastMatch = searchResult._links.last.href.match(/page=(\d+)/);
            if (lastMatch) {
              total = parseInt(lastMatch[1], 10) * limit;
            }
          }

          return {
            records: places,
            total,
            hasMore: hasNext,
          };
        },
      });

      return successResponse({
        source: 'vhd',
        harvested: result.totalHarvested,
        totalAvailable: result.totalAvailable,
        hasMore: result.hasMore,
        nextPage: result.nextCursor,
        records: result.records.map((place) => ({
          id: place.id,
          name: place.name,
          location: place.location,
          heritageAuthority: place.heritage_authority_name,
          vhrNumber: place.vhr_number,
          coordinates: place.latlon,
          url: place.url,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
