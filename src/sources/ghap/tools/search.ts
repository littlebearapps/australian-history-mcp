/**
 * GHAP Search Tool - Search historical Australian placenames
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { ghapClient } from '../client.js';
import { GHAP_STATES, type GHAPSearchParams } from '../types.js';

export const ghapSearchTool: SourceTool = {
  schema: {
    name: 'ghap_search',
    description: 'Search the Gazetteer of Historical Australian Placenames (GHAP) for placenames with coordinates. Includes ANPS gazetteer and community-contributed historical datasets.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Placename to search for (partial match)',
        },
        fuzzy: {
          type: 'boolean',
          description: 'Use fuzzy matching (handles typos)',
          default: false,
        },
        state: {
          type: 'string',
          description: 'Filter by Australian state',
          enum: GHAP_STATES,
        },
        lga: {
          type: 'string',
          description: 'Filter by Local Government Area (e.g., "BALLARAT CITY")',
        },
        bbox: {
          type: 'string',
          description: 'Bounding box: minLon,minLat,maxLon,maxLat (e.g., "143,-38,144,-37")',
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
      query: string;
      fuzzy?: boolean;
      state?: string;
      lga?: string;
      bbox?: string;
      limit?: number;
    };

    if (!input.query || input.query.trim() === '') {
      return errorResponse('Query is required');
    }

    try {
      const params: GHAPSearchParams = {
        limit: Math.min(input.limit ?? 20, 100),
        state: input.state as GHAPSearchParams['state'],
        lga: input.lga,
        bbox: input.bbox,
      };

      // Use fuzzy or contains search
      if (input.fuzzy) {
        params.fuzzyname = input.query;
      } else {
        params.containsname = input.query;
      }

      const result = await ghapClient.search(params);

      return successResponse({
        source: 'ghap',
        totalResults: result.totalResults,
        returned: result.places.length,
        places: result.places.map((p) => ({
          id: p.id,
          name: p.name,
          state: p.state,
          lga: p.lga,
          featureType: p.featureType,
          latitude: p.latitude,
          longitude: p.longitude,
          source: p.source,
          dateRange: p.dateRange,
          url: p.url,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
