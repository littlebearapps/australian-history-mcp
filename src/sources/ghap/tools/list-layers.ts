/**
 * GHAP List Layers Tool - List available historical placename datasets
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { ghapClient } from '../client.js';

export const ghapListLayersTool: SourceTool = {
  schema: {
    name: 'ghap_list_layers',
    description: 'List all available GHAP/TLCMap data layers. These are community-contributed datasets of historical placenames, journeys, and events.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  async execute(_args: Record<string, unknown>) {
    try {
      const layers = await ghapClient.listLayers();

      return successResponse({
        source: 'ghap',
        totalLayers: layers.length,
        layers: layers.map((l) => ({
          id: l.id,
          name: l.name,
          description: l.description?.substring(0, 200),
          creator: l.creator,
          url: l.url,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
