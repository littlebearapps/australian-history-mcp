/**
 * NMA Search Parties Tool - Search for people and organisations
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const nmaSearchPartiesTool: SourceTool = {
  schema: {
    name: 'nma_search_parties',
    description: 'Search people and organisations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        limit: { type: 'number', description: PARAMS.LIMIT },
        offset: { type: 'number', description: PARAMS.OFFSET },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      limit?: number;
      offset?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const result = await nmaClient.searchParties({
        text: input.query,
        limit: Math.min(input.limit ?? 20, 100),
        offset: input.offset,
      });

      return successResponse({
        source: 'nma',
        totalResults: result.meta.results,
        count: result.data.length,
        parties: result.data.map((p) => ({
          id: p.id,
          name: p.name,
          title: p.title,
          description: p.description,
          birthDate: p.birthDate,
          deathDate: p.deathDate,
          birthPlace: p.birthPlace?.title,
          deathPlace: p.deathPlace?.title,
          nationality: p.nationality,
          gender: p.gender,
        })),
        hasMore: !!result.links?.next,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
