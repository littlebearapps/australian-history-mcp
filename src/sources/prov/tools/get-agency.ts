/**
 * PROV Get Agency Tool - Get details of a specific VA agency
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { provClient } from '../client.js';

export const provGetAgencyTool: SourceTool = {
  schema: {
    name: 'prov_get_agency',
    description: 'Get detailed information about a PROV agency (VA) including description, date range, status, and associated series count.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agencyId: {
          type: 'string',
          description: 'Agency ID (e.g., "VA 473" or "473")',
        },
      },
      required: ['agencyId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { agencyId?: string };

    if (!input.agencyId) {
      return errorResponse('agencyId is required');
    }

    try {
      const agency = await provClient.getAgency(input.agencyId);

      if (!agency) {
        return errorResponse(`Agency not found: ${input.agencyId}`);
      }

      return successResponse({
        source: 'prov',
        agency: {
          id: agency.id,
          title: agency.title,
          description: agency.description,
          dateRange: agency.dateRange,
          status: agency.status,
          seriesCount: agency.seriesCount,
          url: `https://prov.vic.gov.au/archive/${agency.id.replace(/\s+/g, '')}`,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
