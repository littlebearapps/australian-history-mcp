/**
 * ACMI Harvest Tool - Bulk download collection works
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { acmiClient } from '../client.js';
import type { ACMIWork } from '../types.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const acmiHarvestTool: SourceTool = {
  schema: {
    name: 'acmi_harvest',
    description: 'Bulk download collection works.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        type: { type: 'string', description: PARAMS.TYPE },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
        startPage: { type: 'number', description: PARAMS.START_PAGE, default: 1 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      type?: string;
      maxRecords?: number;
      startPage?: number;
    };

    try {
      const maxRecords = Math.min(input.maxRecords ?? 100, 1000);
      const startPage = input.startPage ?? 1;

      // Determine if we're searching or listing all
      const useSearch = !!input.query || !!input.type;
      const queryDescription = input.query
        ? `query="${input.query}"`
        : input.type
          ? `type="${input.type}"`
          : 'all works';

      const result = await runHarvest<ACMIWork>('acmi', queryDescription, {
        maxRecords,
        batchSize: 50, // ACMI default page size
        cursorMode: 'page',
        initialCursor: startPage,
        fetchBatch: async (page) => {
          const searchResult = useSearch
            ? await acmiClient.searchWorks({
                query: input.query,
                type: input.type,
                page: page as number,
              })
            : await acmiClient.listWorks(page as number);

          return {
            records: searchResult.results,
            total: searchResult.count,
            hasMore: searchResult.next !== null,
          };
        },
      });

      return successResponse({
        source: 'acmi',
        harvested: result.totalHarvested,
        totalAvailable: result.totalAvailable,
        hasMore: result.hasMore,
        nextPage: result.nextCursor,
        records: result.records.map((work) => ({
          id: work.id,
          acmiId: work.acmi_id,
          title: work.title,
          type: work.type,
          slug: work.slug,
          creatorCredit: work.creator_credit,
          headlineCredit: work.headline_credit,
          productionYear: work.production_dates?.[0]?.date,
          productionPlace: work.production_places?.[0]?.name,
          isOnDisplay: work.is_on_display,
          isIndigenousContext: work.is_context_indigenous,
          webUrl: `https://www.acmi.net.au/works/${work.id}--${work.slug}/`,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
