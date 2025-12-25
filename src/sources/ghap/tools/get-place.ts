/**
 * GHAP Get Place Tool - Get details for a specific placename by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { ghapClient } from '../client.js';

export const ghapGetPlaceTool: SourceTool = {
  schema: {
    name: 'ghap_get_place',
    description: 'Get detailed information about a specific place from GHAP by its TLCMap ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'TLCMap place ID (e.g., "a1b4b8" from search results)',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id: string };

    if (!input.id || input.id.trim() === '') {
      return errorResponse('Place ID is required');
    }

    try {
      const place = await ghapClient.getPlace(input.id);

      if (!place) {
        return errorResponse(`Place not found: ${input.id}`);
      }

      return successResponse({
        source: 'ghap',
        place: {
          id: place.id,
          anpsId: place.anpsId,
          name: place.name,
          state: place.state,
          lga: place.lga,
          featureType: place.featureType,
          description: place.description,
          latitude: place.latitude,
          longitude: place.longitude,
          source: place.source,
          dateRange: place.dateRange,
          url: place.url,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
