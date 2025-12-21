/**
 * VHD Search Shipwrecks Tool - Search Victorian shipwrecks
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { vhdClient } from '../client.js';

export const vhdSearchShipwrecksTool: SourceTool = {
  schema: {
    name: 'vhd_search_shipwrecks',
    description: 'Search Victorian Heritage Database for shipwrecks along the Victorian coast. Returns protected shipwreck sites and maritime heritage.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (ship name, location, or keyword)',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (1-100)',
          default: 20,
        },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      limit?: number;
    };

    try {
      const result = await vhdClient.searchShipwrecks({
        query: input.query,
        limit: Math.min(input.limit ?? 20, 100),
      });

      const shipwrecks = result._embedded?.shipwrecks ?? [];

      return successResponse({
        source: 'vhd',
        returned: shipwrecks.length,
        shipwrecks: shipwrecks.map((wreck) => ({
          id: wreck.id,
          name: wreck.name,
          location: wreck.sw_location,
          heritageAuthority: wreck.heritage_authority_name,
          vhrNumber: wreck.vhr_number,
          url: wreck.url,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
