/**
 * PROV IIIF Image Extraction Tool
 *
 * Fetches and parses IIIF manifests from PROV to extract
 * downloadable image URLs in different sizes.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { provClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { IMAGE_SIZES } from '../../../core/enums.js';

export const provGetImagesTool: SourceTool = {
  schema: {
    name: 'prov_get_images',
    description: 'Extract image URLs from PROV IIIF manifest.',
    inputSchema: {
      type: 'object',
      properties: {
        manifestUrl: { type: 'string', description: PARAMS.MANIFEST_URL },
        pages: { type: 'string', description: PARAMS.PAGES },
        size: { type: 'string', description: PARAMS.IMAGE_SIZE, enum: IMAGE_SIZES },
      },
      required: ['manifestUrl'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      manifestUrl: string;
      pages?: string;
      size?: 'thumbnail' | 'medium' | 'full' | 'all';
    };

    try {
      const result = await provClient.getImages(input.manifestUrl, {
        pageRange: input.pages,
      });

      // Filter to requested size(s)
      const size = input.size ?? 'all';
      const images = result.images.map((img) => {
        if (size === 'all') {
          return img;
        }
        return {
          page: img.page,
          label: img.label,
          url: img[size],
        };
      });

      return successResponse({
        source: 'prov',
        manifestUrl: result.manifestUrl,
        title: result.title,
        description: result.description,
        totalPages: result.totalPages,
        returnedPages: images.length,
        size: size,
        images,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
