/**
 * ACMI Get Constellation Tool - Get curated collection by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';

export const acmiGetConstellationTool: SourceTool = {
  schema: {
    name: 'acmi_get_constellation',
    description: 'Get detailed constellation (curated collection) from ACMI by ID. Returns theme description and work count.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: 'Constellation ID (from list results)',
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
      const constellation = await acmiClient.getConstellation(input.id);

      if (!constellation) {
        return errorResponse(`Constellation not found: ${input.id}`);
      }

      return successResponse({
        source: 'acmi',
        constellation: {
          id: constellation.id,
          name: constellation.name,
          description: constellation.description,
          authors: constellation.authors?.map((a) => a.full_name),
          keyWork: constellation.key_work
            ? {
                id: constellation.key_work.id,
                title: constellation.key_work.title,
                type: constellation.key_work.type,
              }
            : undefined,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
