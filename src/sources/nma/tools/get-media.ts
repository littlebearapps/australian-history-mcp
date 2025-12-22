/**
 * NMA Get Media Tool - Get media item by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';

export const nmaGetMediaTool: SourceTool = {
  schema: {
    name: 'nma_get_media',
    description: 'Get detailed media record from National Museum of Australia by ID. Returns format, dimensions, creator, and rights information.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Media ID (from search results)',
        },
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
      const media = await nmaClient.getMedia(input.id);

      if (!media) {
        return errorResponse(`Media not found: ${input.id}`);
      }

      return successResponse({
        source: 'nma',
        media: {
          id: media.id,
          title: media.title,
          identifier: media.identifier,
          format: media.format,
          dimensions: media.extent ? {
            width: media.extent.width,
            height: media.extent.height,
            units: media.extent.unitText,
          } : undefined,
          creator: media.creator,
          rights: media.rights,
          licence: media.licence,
          metadata: {
            modified: media._meta?.modified,
            downloadUrl: media._meta?.hasFormat,
          },
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
