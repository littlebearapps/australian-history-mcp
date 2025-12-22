/**
 * NMA Search Parties Tool - Search for people and organisations
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';

export const nmaSearchPartiesTool: SourceTool = {
  schema: {
    name: 'nma_search_parties',
    description: 'Search National Museum of Australia for people and organisations (parties) associated with collection objects. Returns artists, makers, donors, historical figures, and organisations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "Harold Cazneaux", "Aboriginal", "photographer")',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (1-100, default 20)',
        },
        offset: {
          type: 'number',
          description: 'Number of results to skip for pagination',
        },
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
