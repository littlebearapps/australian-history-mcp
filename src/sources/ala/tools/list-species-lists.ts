/**
 * ALA List Species Lists Tool - Browse curated species lists
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const alaListSpeciesListsTool: SourceTool = {
  schema: {
    name: 'ala_list_species_lists',
    description: 'List curated species lists.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listType: { type: 'string', description: 'List type filter' },
        limit: { type: 'number', description: PARAMS.LIMIT },
        offset: { type: 'number', description: PARAMS.OFFSET },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      listType?: string;
      limit?: number;
      offset?: number;
    };

    try {
      const result = await alaClient.listSpeciesLists({
        max: Math.min(input.limit ?? 20, 100),
        offset: input.offset,
        listType: input.listType,
      });

      return successResponse({
        source: 'ala',
        totalResults: result.listCount,
        count: result.lists.length,
        lists: result.lists.map((l) => ({
          id: l.dataResourceUid,
          name: l.listName,
          type: l.listType,
          description: l.description,
          itemCount: l.itemCount,
          isAuthoritative: l.isAuthoritative,
          region: l.region,
          dateCreated: l.dateCreated,
          lastUpdated: l.lastUpdated,
        })),
        hasMore: result.offset + result.lists.length < result.listCount,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
