/**
 * NMA Search Places Tool - Search places in the NMA collection
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';

export const nmaSearchPlacesTool: SourceTool = {
  schema: {
    name: 'nma_search_places',
    description: 'Search National Museum of Australia for places associated with collection objects. Returns historical locations, sites, and geographic references.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Place name or location to search for',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (1-100)',
          default: 20,
        },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      limit?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const result = await nmaClient.searchPlaces({
        text: input.query,
        limit: Math.min(input.limit ?? 20, 100),
      });

      return successResponse({
        source: 'nma',
        totalResults: result.meta.results,
        returned: result.data.length,
        places: result.data.map((place) => ({
          id: place.id,
          title: place.title,
          coordinates: place.geo,
          description: place.description,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
