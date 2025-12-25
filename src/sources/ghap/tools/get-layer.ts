/**
 * GHAP Get Layer Tool - Get all places from a specific data layer
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { ghapClient } from '../client.js';

export const ghapGetLayerTool: SourceTool = {
  schema: {
    name: 'ghap_get_layer',
    description: 'Get all places from a specific GHAP/TLCMap data layer by ID. Use ghap_list_layers to find available layers.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        layerId: {
          type: 'number',
          description: 'Layer ID (from ghap_list_layers results)',
        },
      },
      required: ['layerId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { layerId: number };

    if (!input.layerId) {
      return errorResponse('Layer ID is required');
    }

    try {
      const result = await ghapClient.getLayer(input.layerId);

      return successResponse({
        source: 'ghap',
        layer: {
          id: result.layer.id,
          name: result.layer.name,
          description: result.layer.description,
          url: result.layer.url,
        },
        totalPlaces: result.places.length,
        places: result.places.map((p) => ({
          id: p.id,
          name: p.name,
          state: p.state,
          latitude: p.latitude,
          longitude: p.longitude,
          featureType: p.featureType,
          dateRange: p.dateRange,
          url: p.url,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
