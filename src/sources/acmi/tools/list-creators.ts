/**
 * ACMI List Creators Tool - List creators (directors, actors, studios)
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';

export const acmiListCreatorsTool: SourceTool = {
  schema: {
    name: 'acmi_list_creators',
    description: 'List creators from the ACMI collection. Returns directors, actors, studios, and other contributors associated with films, TV, and videogames.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: {
          type: 'number',
          description: 'Page number (1-based, default 1)',
        },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { page?: number };

    try {
      const result = await acmiClient.listCreators(input.page ?? 1);

      return successResponse({
        source: 'acmi',
        totalResults: result.count,
        count: result.results.length,
        page: input.page ?? 1,
        creators: result.results.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          wikidataId: c.wikidata_id,
          worksCount: c.works_count,
        })),
        hasNext: !!result.next,
        hasPrevious: !!result.previous,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
