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
    description: 'List/search 1500+ contributing libraries with optional pagination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY_OPTIONAL },
        reclevel: { type: 'string', description: PARAMS.RECLEVEL, enum: REC_LEVELS, default: 'brief' },
        offset: { type: 'number', description: 'Number of contributors to skip (default: 0)', default: 0 },
        limit: { type: 'number', description: 'Maximum contributors to return (default: 100, max: 500)', default: 100 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      reclevel?: TroveRecLevel;
      offset?: number;
      limit?: number;
    };

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    try {
      const offset = Math.max(0, input.offset ?? 0);
      const limit = Math.min(500, Math.max(1, input.limit ?? 100));

      // API returns all contributors at once; we paginate client-side
      const allContributors = await troveClient.listContributors({
        query: input.query,
        reclevel: input.reclevel || 'brief',
      });

      // Apply client-side pagination
      const paginatedContributors = allContributors.slice(offset, offset + limit);
      const hasMore = offset + limit < allContributors.length;

      return successResponse({
        source: 'trove',
        query: input.query || null,
        totalResults: allContributors.length,
        returned: paginatedContributors.length,
        _pagination: {
          offset,
          limit,
          hasMore,
          nextOffset: hasMore ? offset + limit : null,
        },
        contributors: paginatedContributors.map((c) => ({
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
