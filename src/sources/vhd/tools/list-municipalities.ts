/**
 * VHD List Municipalities Tool - List all Victorian municipalities (LGAs)
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { vhdClient } from '../client.js';

export const vhdListMunicipalitiesTool: SourceTool = {
  schema: {
    name: 'vhd_list_municipalities',
    description: 'List Victorian municipalities (LGAs).',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  async execute() {
    try {
      const municipalities = await vhdClient.listMunicipalities();

      return successResponse({
        source: 'vhd',
        count: municipalities.length,
        municipalities: municipalities.map((m) => ({
          id: m.id,
          name: m.name,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
