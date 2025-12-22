/**
 * ALA List Species Lists Tool - Browse curated species lists
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';

export const alaListSpeciesListsTool: SourceTool = {
  schema: {
    name: 'ala_list_species_lists',
    description: 'List species lists from the Atlas of Living Australia. These are curated lists of species for conservation, invasive species, threatened species, and other purposes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listType: {
          type: 'string',
          description: 'Filter by list type (e.g., "CONSERVATION_LIST", "SENSITIVE_LIST", "INVASIVE")',
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
