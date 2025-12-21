/**
 * PROV Harvest Tool - Bulk download records from PROV
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { provClient } from '../client.js';
import { PROV_RECORD_FORMS, type PROVRecord } from '../types.js';

export const provHarvestTool: SourceTool = {
  schema: {
    name: 'prov_harvest',
    description: 'Bulk download PROV records with pagination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search text',
        },
        series: {
          type: 'string',
          description: 'VPRS series number',
        },
        agency: {
          type: 'string',
          description: 'VA agency number',
        },
        recordForm: {
          type: 'string',
          description: 'Record type filter',
          enum: PROV_RECORD_FORMS,
        },
        dateFrom: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)',
        },
        dateTo: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)',
        },
        digitisedOnly: {
          type: 'boolean',
          description: 'Only digitised records',
          default: false,
        },
        maxRecords: {
          type: 'number',
          description: 'Maximum records to harvest (1-1000)',
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
      series?: string;
      agency?: string;
      recordForm?: string;
      dateFrom?: string;
      dateTo?: string;
      digitisedOnly?: boolean;
      maxRecords?: number;
      startFrom?: number;
    };

    // Validate at least one search parameter
    if (!input.query && !input.series && !input.agency) {
      return errorResponse('At least one of query, series, or agency is required');
    }

    try {
      const maxRecords = Math.min(input.maxRecords ?? 100, 1000);
      const startFrom = input.startFrom ?? 0;

      // Build query description for response
      const queryDesc = [
        input.query && `query="${input.query}"`,
        input.series && `series=${input.series}`,
        input.agency && `agency=${input.agency}`,
      ].filter(Boolean).join(', ');

      const result = await runHarvest<PROVRecord>('prov', queryDesc, {
        maxRecords,
        batchSize: 100,
        cursorMode: 'offset',
        initialCursor: startFrom,
        fetchBatch: async (offset, limit) => {
          const searchResult = await provClient.search({
            query: input.query,
            series: input.series,
            agency: input.agency,
            recordForm: input.recordForm,
            startDate: input.dateFrom,
            endDate: input.dateTo,
            digitisedOnly: input.digitisedOnly ?? false,
            rows: limit,
            start: offset as number,
          });

          return {
            records: searchResult.records,
            total: searchResult.totalResults,
            hasMore: (offset as number) + searchResult.records.length < searchResult.totalResults,
          };
        },
      });

      return successResponse({
        source: 'prov',
        harvested: result.totalHarvested,
        totalAvailable: result.totalAvailable,
        hasMore: result.hasMore,
        nextOffset: result.nextCursor?.toString(),
        records: result.records,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
