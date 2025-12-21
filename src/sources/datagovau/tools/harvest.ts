/**
 * data.gov.au Harvest Tool - Bulk download dataset metadata
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { dataGovAUClient } from '../client.js';
import type { DataGovAUDataset } from '../types.js';

export const dataGovAUHarvestTool: SourceTool = {
  schema: {
    name: 'datagovau_harvest',
    description: 'Bulk download dataset metadata with pagination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search keywords',
        },
        organization: {
          type: 'string',
          description: 'Filter by organisation slug',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags',
        },
        format: {
          type: 'string',
          description: 'Resource format filter',
        },
        maxRecords: {
          type: 'number',
          description: 'Maximum datasets to harvest (1-1000)',
          default: 100,
        },
        startFrom: {
          type: 'number',
          description: 'Offset for pagination',
          default: 0,
        },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      organization?: string;
      tags?: string[];
      format?: string;
      maxRecords?: number;
      startFrom?: number;
    };

    try {
      const maxRecords = Math.min(input.maxRecords ?? 100, 1000);
      const startFrom = input.startFrom ?? 0;

      // Build query description for response
      const queryDesc = [
        input.query && `query="${input.query}"`,
        input.organization && `org=${input.organization}`,
        input.format && `format=${input.format}`,
      ].filter(Boolean).join(', ') || 'all datasets';

      const result = await runHarvest<DataGovAUDataset>('datagovau', queryDesc, {
        maxRecords,
        batchSize: 100,
        cursorMode: 'offset',
        initialCursor: startFrom,
        fetchBatch: async (offset, limit) => {
          const searchResult = await dataGovAUClient.search({
            query: input.query,
            organization: input.organization,
            tags: input.tags,
            format: input.format,
            limit,
            offset: offset as number,
          });

          return {
            records: searchResult.datasets,
            total: searchResult.count,
            hasMore: (offset as number) + searchResult.datasets.length < searchResult.count,
          };
        },
      });

      return successResponse({
        source: 'datagovau',
        harvested: result.totalHarvested,
        totalAvailable: result.totalAvailable,
        hasMore: result.hasMore,
        nextOffset: result.nextCursor?.toString(),
        datasets: result.records.map(d => ({
          id: d.id,
          name: d.name,
          title: d.title,
          organization: d.organization?.title,
          resourceCount: d.resources.length,
          formats: [...new Set(d.resources.map(r => r.format))],
          modified: d.metadataModified,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
