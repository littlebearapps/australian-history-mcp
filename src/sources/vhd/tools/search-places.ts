/**
 * VHD Search Places Tool - Search Victorian heritage places
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { vhdClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const vhdSearchPlacesTool: SourceTool = {
  schema: {
    name: 'vhd_search_places',
    description: 'Search Victorian heritage places.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        municipality: { type: 'string', description: PARAMS.MUNICIPALITY },
        architecturalStyle: { type: 'string', description: PARAMS.ARCH_STYLE },
        period: { type: 'string', description: PARAMS.PERIOD },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      municipality?: string;
      architecturalStyle?: string;
      period?: string;
      limit?: number;
    };

    try {
      const result = await vhdClient.searchPlaces({
        query: input.query,
        municipality: input.municipality,
        architecturalStyle: input.architecturalStyle,
        period: input.period,
        limit: Math.min(input.limit ?? 20, 100),
      });

      const places = result._embedded?.places ?? [];

      return successResponse({
        source: 'vhd',
        returned: places.length,
        places: places.map((place) => ({
          id: place.id,
          name: place.name,
          location: place.location,
          summary: place.summary?.substring(0, 300),
          heritageAuthority: place.heritage_authority_name,
          vhrNumber: place.vhr_number,
          overlays: place.overlay_numbers,
          coordinates: place.latlon,
          imageUrl: place.primary_image_url,
          url: place.url,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
