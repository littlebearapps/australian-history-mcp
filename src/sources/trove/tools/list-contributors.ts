/**
 * Trove List Contributors Tool - List/search all contributing libraries
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import type { TroveRecLevel } from '../types.js';

export const troveListContributorsTool: SourceTool = {
  schema: {
    name: 'trove_list_contributors',
    description: 'List or search Trove contributors (1500+ libraries, archives, and institutions). Returns NUC codes, names, and contact details.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Optional search query to filter contributors by name (e.g., "university", "state library")',
        },
        reclevel: {
          type: 'string',
          enum: ['brief', 'full'],
          default: 'brief',
          description: 'Record detail level: "brief" for basic info, "full" for extended details',
        },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      reclevel?: TroveRecLevel;
    };

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    try {
      const contributors = await troveClient.listContributors({
        query: input.query,
        reclevel: input.reclevel || 'brief',
      });

      return successResponse({
        source: 'trove',
        query: input.query || null,
        totalResults: contributors.length,
        contributors: contributors.map((c) => ({
          nuc: c.nuc,
          name: c.name,
          shortname: c.shortname,
          url: c.url,
          address: c.address,
          email: c.email,
          phone: c.phone,
          catalogue: c.catalogue,
          totalHoldings: c.totalHoldings,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
