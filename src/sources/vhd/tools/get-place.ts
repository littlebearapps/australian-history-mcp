/**
 * VHD Get Place Tool - Get detailed heritage place by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { vhdClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const vhdGetPlaceTool: SourceTool = {
  schema: {
    name: 'vhd_get_place',
    description: 'Get heritage place by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: PARAMS.ID },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id?: number };

    if (!input.id) {
      return errorResponse('id is required');
    }

    try {
      const place = await vhdClient.getPlace(input.id);

      if (!place) {
        return errorResponse(`Place not found: ${input.id}`);
      }

      return successResponse({
        source: 'vhd',
        place: {
          id: place.id,
          name: place.name,
          location: place.location,
          coordinates: place.latlon,
          summary: place.summary,
          description: place.description,
          history: place.history,
          heritageAuthority: place.heritage_authority_name,
          vhrNumber: place.vhr_number,
          overlays: place.overlay_numbers,
          municipality: place.municipality?.name,
          architecturalStyle: place.architectural_style?.name,
          period: place.period?.name,
          dateCreated: place.date_created,
          dateModified: place.date_modified,
          primaryImage: {
            url: place.primary_image_url,
            caption: place.primary_image_caption,
          },
          images: place.images
            ? Object.entries(place.images).map(([key, img]) => ({
                id: key,
                url: img.image_url,
                caption: img.image_caption,
                photographer: img.image_by,
                type: img.image_type,
              }))
            : [],
          url: place.url,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
