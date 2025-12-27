/**
 * PROV Get Series Tool - Get details of a specific VPRS series
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { provClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const provGetSeriesTool: SourceTool = {
  schema: {
    name: 'prov_get_series',
    description: 'Get PROV series details by VPRS number.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        seriesId: { type: 'string', description: PARAMS.SERIES },
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
