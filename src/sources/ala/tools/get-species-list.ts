/**
 * ALA Get Species List Tool - Get detailed species list by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';

export const alaGetSpeciesListTool: SourceTool = {
  schema: {
    name: 'ala_get_species_list',
    description: 'Get detailed species list from the Atlas of Living Australia by ID. Returns the list metadata and all species included in the list.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Species list ID (dataResourceUid, e.g., "dr649")',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id?: string };

    if (!input.id) {
      return errorResponse('id is required');
    }

    try {
      const list = await alaClient.getSpeciesList(input.id);

      if (!list) {
        return errorResponse(`Species list not found: ${input.id}`);
      }

      return successResponse({
        source: 'ala',
        list: {
          id: list.dataResourceUid,
          name: list.listName,
          type: list.listType,
          description: list.description,
          itemCount: list.itemCount,
          dateCreated: list.dateCreated,
          lastUpdated: list.lastUpdated,
          items: list.items.map((item) => ({
            id: item.id,
            scientificName: item.name,
            commonName: item.commonName,
            lsid: item.lsid,
            attributes: item.kvpValues,
          })),
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
