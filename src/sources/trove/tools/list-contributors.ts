/**
 * Trove List Contributors Tool - List/search all contributing libraries
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { REC_LEVELS } from '../../../core/enums.js';
import type { TroveRecLevel } from '../types.js';

export const troveListContributorsTool: SourceTool = {
  schema: {
    name: 'trove_list_contributors',
    description: 'List/search 1500+ contributing libraries.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY_OPTIONAL },
        reclevel: { type: 'string', description: PARAMS.RECLEVEL, enum: REC_LEVELS, default: 'brief' },
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
