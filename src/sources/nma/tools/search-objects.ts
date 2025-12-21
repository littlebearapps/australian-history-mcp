/**
 * NMA Search Objects Tool - Search museum collection objects
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';

export const nmaSearchObjectsTool: SourceTool = {
  schema: {
    name: 'nma_search_objects',
    description: 'Search National Museum of Australia collection for objects by keyword. Returns museum artefacts, photographs, technology, and historical items.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "boomerang", "gold rush", "convict")',
        },
        type: {
          type: 'string',
          description: 'Object type filter (e.g., "Photographs", "Boomerangs")',
        },
        collection: {
          type: 'string',
          description: 'Collection name filter',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (1-100)',
          default: 20,
        },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      type?: string;
      collection?: string;
      limit?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const result = await nmaClient.searchObjects({
        text: input.query,
        type: input.type,
        collection: input.collection,
        limit: Math.min(input.limit ?? 20, 100),
      });

      return successResponse({
        source: 'nma',
        totalResults: result.meta.results,
        returned: result.data.length,
        objects: result.data.map((obj) => ({
          id: obj.id,
          title: obj.title,
          type: obj.additionalType?.join(', '),
          collection: obj.collection?.title,
          identifier: obj.identifier,
          materials: obj.medium?.map((m) => m.title).join(', '),
          description: obj.physicalDescription?.substring(0, 300),
          location: obj.spatial?.[0]?.title,
          modified: obj._meta?.modified,
          licence: obj._meta?.licence,
          webUrl: obj._meta?.hasFormat,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
