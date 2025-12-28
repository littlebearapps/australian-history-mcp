/**
 * NMA Search Media Tool - Search for images, videos, and sound recordings
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const nmaSearchMediaTool: SourceTool = {
  schema: {
    name: 'nma_search_media',
    description: 'Search images, videos, and sound recordings.',
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
      const result = await nmaClient.searchMedia({
        text: input.query,
        limit: Math.min(input.limit ?? 20, 100),
        offset: input.offset,
      });

      return successResponse({
        source: 'nma',
        totalResults: result.meta.results,
        count: result.data.length,
        media: result.data.map((m) => ({
          id: m.id,
          title: m.title,
          identifier: m.identifier,
          format: m.format,
          dimensions: m.extent ? {
            width: m.extent.width,
            height: m.extent.height,
            units: m.extent.unitText,
          } : undefined,
          creator: m.creator,
          rights: m.rights,
          licence: m.licence,
        })),
        hasMore: !!result.links?.next,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
