/**
 * NMA Search Media Tool - Search for images, videos, and sound recordings
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';

export const nmaSearchMediaTool: SourceTool = {
  schema: {
    name: 'nma_search_media',
    description: 'Search National Museum of Australia for media items including images, videos, and sound recordings. Returns media associated with collection objects.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "gold rush photograph", "aboriginal art")',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (1-100, default 20)',
        },
        offset: {
          type: 'number',
          description: 'Number of results to skip for pagination',
        },
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
