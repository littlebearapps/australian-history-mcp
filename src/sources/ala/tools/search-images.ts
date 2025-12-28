/**
 * ALA Search Images Tool - Search for images of Australian species
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const alaSearchImagesTool: SourceTool = {
  schema: {
    name: 'ala_search_images',
    description: 'Search species images.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        limit: { type: 'number', description: PARAMS.LIMIT },
        offset: { type: 'number', description: PARAMS.OFFSET },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      limit?: number;
      offset?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const result = await alaClient.searchImages({
        q: input.query,
        pageSize: Math.min(input.limit ?? 20, 100),
        offset: input.offset,
      });

      return successResponse({
        source: 'ala',
        totalResults: result.totalRecords,
        count: result.images.length,
        images: result.images.map((img) => ({
          imageId: img.imageId,
          imageUrl: img.imageUrl,
          thumbnailUrl: img.thumbnailUrl,
          largeImageUrl: img.largeImageUrl,
          title: img.title,
          creator: img.creator,
          license: img.license ?? img.recognisedLicence,
          scientificName: img.scientificName,
          vernacularName: img.vernacularName,
          dataResourceName: img.dataResourceName,
        })),
        hasMore: result.startIndex + result.images.length < result.totalRecords,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
