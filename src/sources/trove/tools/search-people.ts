/**
 * Trove Search People Tool - Search people and organisations
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { PERSON_TYPES } from '../../../core/enums.js';
import type { TrovePersonType } from '../types.js';

export const troveSearchPeopleTool: SourceTool = {
  schema: {
    name: 'trove_search_people',
    description: 'Search people and organisations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        type: { type: 'string', description: PARAMS.TYPE, enum: PERSON_TYPES },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
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
