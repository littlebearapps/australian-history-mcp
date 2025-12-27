/**
 * ACMI Get Constellation Tool - Get curated collection by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const acmiGetConstellationTool: SourceTool = {
  schema: {
    name: 'acmi_get_constellation',
    description: 'Get constellation by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: PARAMS.ID },
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
