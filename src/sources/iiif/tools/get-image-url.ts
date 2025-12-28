/**
 * IIIF Get Image URL Tool
 *
 * Constructs IIIF Image API URLs for various sizes, regions, and formats.
 * Works with any IIIF Image API v2.x compliant server.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { iiifClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const iiifGetImageUrlTool: SourceTool = {
  schema: {
    name: 'iiif_get_image_url',
    description: 'Construct IIIF Image API URL for any size/format.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        imageServiceUrl: { type: 'string', description: PARAMS.IMAGE_SERVICE_URL },
        region: { type: 'string', description: PARAMS.REGION, default: 'full' },
        size: { type: 'string', description: PARAMS.SIZE, default: 'max' },
        rotation: { type: 'string', description: PARAMS.ROTATION, default: '0' },
        quality: { type: 'string', description: PARAMS.QUALITY, enum: ['default', 'color', 'gray', 'bitonal'], default: 'default' },
        format: { type: 'string', description: PARAMS.FORMAT, enum: ['jpg', 'png', 'gif', 'webp', 'tif'], default: 'jpg' },
      },
      required: ['imageServiceUrl'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      imageServiceUrl: string;
      region?: string;
      size?: string;
      rotation?: string;
      quality?: 'default' | 'color' | 'gray' | 'bitonal';
      format?: 'jpg' | 'png' | 'gif' | 'webp' | 'tif';
    };

    try {
      const url = iiifClient.constructImageUrl({
        baseUrl: input.imageServiceUrl,
        region: (input.region ?? 'full') as 'full',
        size: (input.size ?? 'max') as 'max',
        rotation: (input.rotation ?? '0') as '0',
        quality: input.quality ?? 'default',
        format: input.format ?? 'jpg',
      });

      // Parse size for response description
      let sizeDescription = input.size ?? 'max (full resolution)';
      if (input.size?.startsWith('!')) {
        sizeDescription = `Best fit within ${input.size.substring(1)} pixels`;
      } else if (input.size?.startsWith('pct:')) {
        sizeDescription = `${input.size.substring(4)}% of original`;
      } else if (input.size === 'max' || input.size === 'full') {
        sizeDescription = 'Full resolution';
      }

      return successResponse({
        source: 'iiif',
        imageUrl: url,
        parameters: {
          imageServiceUrl: input.imageServiceUrl,
          region: input.region ?? 'full',
          size: input.size ?? 'max',
          rotation: input.rotation ?? '0',
          quality: input.quality ?? 'default',
          format: input.format ?? 'jpg',
        },
        description: `IIIF Image URL constructed. Size: ${sizeDescription}`,
        usageNote: 'Use this URL to download the image directly. The server will generate the requested variant on-demand.',
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
