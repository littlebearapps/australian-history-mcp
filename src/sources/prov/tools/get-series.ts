/**
 * PROV Get Series Tool - Get details of a specific VPRS series
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { provClient } from '../client.js';

export const provGetSeriesTool: SourceTool = {
  schema: {
    name: 'prov_get_series',
    description: 'Get detailed information about a PROV series (VPRS) including description, agency, date range, and access status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        seriesId: {
          type: 'string',
          description: 'Series ID (e.g., "VPRS 515" or "515")',
        },
      },
      required: ['seriesId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { seriesId?: string };

    if (!input.seriesId) {
      return errorResponse('seriesId is required');
    }

    try {
      const series = await provClient.getSeries(input.seriesId);

      if (!series) {
        return errorResponse(`Series not found: ${input.seriesId}`);
      }

      return successResponse({
        source: 'prov',
        series: {
          id: series.id,
          title: series.title,
          description: series.description,
          agency: series.agency,
          agencyTitle: series.agencyTitle,
          dateRange: series.dateRange,
          accessStatus: series.accessStatus,
          itemCount: series.itemCount,
          url: `https://prov.vic.gov.au/archive/${series.id.replace(/\s+/g, '')}`,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
