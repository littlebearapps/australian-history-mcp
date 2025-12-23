/**
 * Trove Search People Tool - Search people and organisations
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import type { TrovePersonType } from '../types.js';

export const troveSearchPeopleTool: SourceTool = {
  schema: {
    name: 'trove_search_people',
    description: 'Search for people, organisations, and families in Trove. Returns biographical records with occupations, biographies, and thumbnails.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query for people/organisations (e.g., "Henry Lawson", "Australian Museum")',
        },
        type: {
          type: 'string',
          enum: ['Person', 'Organisation', 'Family'],
          description: 'Filter by entity type',
        },
        limit: {
          type: 'number',
          default: 20,
          description: 'Maximum results to return (1-100)',
        },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      type?: TrovePersonType;
      limit?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    // Validate limit
    const limit = Math.min(Math.max(input.limit || 20, 1), 100);

    try {
      const result = await troveClient.searchPeople(input.query, {
        limit,
        type: input.type,
      });

      return successResponse({
        source: 'trove',
        query: result.query,
        totalResults: result.totalResults,
        returned: result.records.length,
        nextStart: result.nextStart,
        records: result.records.map((p) => ({
          id: p.id,
          type: p.type,
          name: p.primaryName,
          displayName: p.primaryDisplayName,
          alternateNames: p.alternateName,
          title: p.title,
          occupation: p.occupation,
          biography: p.biography ? (p.biography.length > 200 ? p.biography.substring(0, 200) + '...' : p.biography) : undefined,
          contributor: p.contributor,
          thumbnailUrl: p.thumbnailUrl,
          url: p.troveUrl,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
