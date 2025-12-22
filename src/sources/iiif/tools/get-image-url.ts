/**
 * IIIF Get Image URL Tool
 *
 * Constructs IIIF Image API URLs for various sizes, regions, and formats.
 * Works with any IIIF Image API v2.x compliant server.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { iiifClient } from '../client.js';

export const iiifGetImageUrlTool: SourceTool = {
  schema: {
    name: 'iiif_get_image_url',
    description: `Construct IIIF Image API URLs for downloading images in various sizes and formats.

Requires an image service URL from a manifest (imageServiceUrl field from iiif_get_manifest).

Examples:
- Full size: region=full, size=max
- Thumbnail: region=full, size=!200,200
- Specific region: region=100,100,500,500, size=max
- Percentage: region=full, size=pct:50`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        imageServiceUrl: {
          type: 'string',
          description: 'The IIIF Image API base URL (from manifest imageServiceUrl field)',
        },
        region: {
          type: 'string',
          description: 'Image region: "full", "square", or "x,y,w,h" coordinates, or "pct:x,y,w,h" for percentages',
          default: 'full',
        },
        size: {
          type: 'string',
          description: 'Image size: "max", "full", "w,", ",h", "pct:n", "w,h", or "!w,h" (best fit)',
          default: 'max',
        },
        rotation: {
          type: 'string',
          description: 'Rotation in degrees: "0", "90", "180", "270", or "!n" for mirrored',
          default: '0',
        },
        quality: {
          type: 'string',
          description: 'Image quality: "default", "color", "gray", or "bitonal"',
          enum: ['default', 'color', 'gray', 'bitonal'],
          default: 'default',
        },
        format: {
          type: 'string',
          description: 'Output format: "jpg", "png", "gif", "webp", or "tif"',
          enum: ['jpg', 'png', 'gif', 'webp', 'tif'],
          default: 'jpg',
        },
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
