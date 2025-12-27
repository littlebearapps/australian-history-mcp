/**
 * PROV Search Tool - Search the Public Record Office Victoria collection
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { provClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { PROV_RECORD_FORMS, PROV_DOCUMENT_CATEGORIES } from '../../../core/enums.js';
import type { PROVSearchParams } from '../types.js';

export const provSearchTool: SourceTool = {
  schema: {
    name: 'prov_search',
    description: 'Search Victorian state archives: photos, maps, records.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        series: { type: 'string', description: PARAMS.SERIES },
        agency: { type: 'string', description: PARAMS.AGENCY },
        recordForm: { type: 'string', description: PARAMS.RECORD_FORM, enum: PROV_RECORD_FORMS },
        category: { type: 'string', description: PARAMS.CATEGORY, enum: PROV_DOCUMENT_CATEGORIES },
        dateFrom: { type: 'string', description: PARAMS.DATE_FROM },
        dateTo: { type: 'string', description: PARAMS.DATE_TO },
        digitisedOnly: { type: 'boolean', description: PARAMS.DIGITISED_ONLY, default: false },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
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
      category?: string;
      dateFrom?: string;
      dateTo?: string;
      digitisedOnly?: boolean;
      limit?: number;
    };

    // Validate at least one search parameter
    if (!input.query && !input.series && !input.agency) {
      return errorResponse('At least one of query, series, or agency is required');
    }

    try {
      const params: PROVSearchParams = {
        query: input.query,
        series: input.series,
        agency: input.agency,
        recordForm: input.recordForm,
        category: input.category as PROVSearchParams['category'],
        startDate: input.dateFrom,
        endDate: input.dateTo,
        digitisedOnly: input.digitisedOnly ?? false,
        rows: Math.min(input.limit ?? 20, 100),
      };

      const result = await provClient.search(params);

      return successResponse({
        source: 'prov',
        totalResults: result.totalResults,
        returned: result.records.length,
        records: result.records.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description?.substring(0, 200),
          series: r.series,
          seriesTitle: r.seriesTitle,
          agency: r.agency,
          recordForm: r.recordForm,
          dateRange: r.startDate && r.endDate
            ? `${r.startDate} - ${r.endDate}`
            : r.startDate || r.endDate,
          digitised: r.digitised,
          url: r.url,
          iiifManifest: r.iiifManifest,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
