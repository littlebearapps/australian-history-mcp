/**
 * Trove Get Contributor Tool - Get library/archive details by NUC code
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const troveGetContributorTool: SourceTool = {
  schema: {
    name: 'trove_get_contributor',
    description: 'Get contributor details by NUC code.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        nuc: { type: 'string', description: PARAMS.NUC },
      },
      required: ['nuc'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { nuc?: string };

    if (!input.nuc) {
      return errorResponse('nuc is required');
    }

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    try {
      const contributor = await troveClient.getContributor(input.nuc);

      if (!contributor) {
        return errorResponse(`Contributor not found: ${input.nuc}`);
      }

      return successResponse({
        source: 'trove',
        contributor: {
          nuc: contributor.nuc,
          name: contributor.name,
          shortname: contributor.shortname,
          url: contributor.url,
          address: contributor.address,
          email: contributor.email,
          phone: contributor.phone,
          catalogue: contributor.catalogue,
          totalHoldings: contributor.totalHoldings,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
