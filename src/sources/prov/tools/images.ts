/**
 * PROV IIIF Image Extraction Tool
 *
 * Fetches and parses IIIF manifests from PROV to extract
 * downloadable image URLs in different sizes.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { provClient } from '../client.js';

export const provGetImagesTool: SourceTool = {
  schema: {
    name: 'prov_get_images',
    description: 'Extract image URLs from a PROV digitised record via IIIF manifest.',
    inputSchema: {
      type: 'object',
      properties: {
        manifestUrl: {
          type: 'string',
          description: 'IIIF manifest URL from search result',
        },
        pages: {
          type: 'string',
          description: 'Page filter (e.g., "1-5", "1,3,7")',
        },
        size: {
          type: 'string',
          enum: ['thumbnail', 'medium', 'full', 'all'],
          description: 'Which size URLs to return. Default: "all"',
        },
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
