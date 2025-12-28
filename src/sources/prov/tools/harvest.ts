/**
 * PROV Harvest Tool - Bulk download records from PROV
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { runHarvest } from '../../../core/harvest-runner.js';
import { provClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { PROV_RECORD_FORMS } from '../../../core/enums.js';
import type { PROVRecord } from '../types.js';

export const provHarvestTool: SourceTool = {
  schema: {
    name: 'prov_harvest',
    description: 'Bulk download PROV records with pagination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        series: { type: 'string', description: PARAMS.SERIES },
        agency: { type: 'string', description: PARAMS.AGENCY },
        recordForm: { type: 'string', description: PARAMS.RECORD_FORM, enum: PROV_RECORD_FORMS },
        dateFrom: { type: 'string', description: PARAMS.DATE_FROM },
        dateTo: { type: 'string', description: PARAMS.DATE_TO },
        digitisedOnly: { type: 'boolean', description: PARAMS.DIGITISED_ONLY, default: false },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
        startFrom: { type: 'number', description: PARAMS.START_FROM, default: 0 },
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
