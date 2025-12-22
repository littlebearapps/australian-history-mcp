/**
 * ACMI Get Creator Tool - Get creator details by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';

export const acmiGetCreatorTool: SourceTool = {
  schema: {
    name: 'acmi_get_creator',
    description: 'Get detailed creator information from ACMI by ID. Returns biography, Wikidata links, and work count for directors, actors, studios, etc.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: 'Creator ID (from list results or work details)',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id?: number };

    if (!input.id) {
      return errorResponse('id is required');
    }

    try {
      const creator = await acmiClient.getCreator(input.id);

      if (!creator) {
        return errorResponse(`Creator not found: ${input.id}`);
      }

      return successResponse({
        source: 'acmi',
        creator: {
          id: creator.id,
          name: creator.name,
          slug: creator.slug,
          wikidataId: creator.wikidata_id,
          biography: creator.biography,
          worksCount: creator.works_count,
          acmiUrl: `https://www.acmi.net.au/creators/${creator.slug}/`,
          wikidataUrl: creator.wikidata_id
            ? `https://www.wikidata.org/wiki/${creator.wikidata_id}`
            : undefined,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
