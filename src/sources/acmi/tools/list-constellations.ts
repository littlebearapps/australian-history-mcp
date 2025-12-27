/**
 * ACMI List Constellations Tool - List curated collections
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const acmiListConstellationsTool: SourceTool = {
  schema: {
    name: 'acmi_list_constellations',
    description: 'List curated thematic collections.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: { type: 'number', description: PARAMS.PAGE },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { page?: number };

    try {
      const result = await acmiClient.listConstellations(input.page ?? 1);

      return successResponse({
        source: 'acmi',
        totalResults: result.count,
        count: result.results.length,
        page: input.page ?? 1,
        constellations: result.results.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
        })),
        hasNext: !!result.next,
        hasPrevious: !!result.previous,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
