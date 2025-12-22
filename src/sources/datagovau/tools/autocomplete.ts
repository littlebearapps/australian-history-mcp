/**
 * data.gov.au Autocomplete Tool - Autocomplete dataset names and titles
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { dataGovAUClient } from '../client.js';

export const dataGovAUAutocompleteTool: SourceTool = {
  schema: {
    name: 'datagovau_autocomplete',
    description: 'Autocomplete dataset names and titles from data.gov.au. Useful for discovering datasets when you only know part of the name.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Partial dataset name or title to autocomplete (e.g., "census", "weather")',
        },
        limit: {
          type: 'number',
          description: 'Maximum suggestions to return (1-20, default 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { query?: string; limit?: number };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const results = await dataGovAUClient.autocomplete(
        input.query,
        Math.min(input.limit ?? 10, 20)
      );

      return successResponse({
        source: 'datagovau',
        query: input.query,
        count: results.length,
        suggestions: results.map((r) => ({
          name: r.name,
          title: r.title,
          url: `https://data.gov.au/data/dataset/${r.name}`,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
