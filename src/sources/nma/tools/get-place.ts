/**
 * NMA Get Place Tool - Get place of significance by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const nmaGetPlaceTool: SourceTool = {
  schema: {
    name: 'nma_get_place',
    description: 'Get place by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: PARAMS.ID },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id?: string };

    if (!input.id) {
      return errorResponse('id is required');
    }

    try {
      const place = await nmaClient.getPlace(input.id);

      if (!place) {
        return errorResponse(`Place not found: ${input.id}`);
      }

      return successResponse({
        source: 'nma',
        place: {
          id: place.id,
          title: place.title,
          description: place.description,
          coordinates: place.geo,
          metadata: {
            modified: place._meta?.modified,
            issued: place._meta?.issued,
          },
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
