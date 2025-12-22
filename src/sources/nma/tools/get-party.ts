/**
 * NMA Get Party Tool - Get person or organisation by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';

export const nmaGetPartyTool: SourceTool = {
  schema: {
    name: 'nma_get_party',
    description: 'Get detailed person or organisation record from National Museum of Australia by ID. Returns biographical details, birth/death info, and associated metadata.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Party ID (from search results)',
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
      const party = await nmaClient.getParty(input.id);

      if (!party) {
        return errorResponse(`Party not found: ${input.id}`);
      }

      return successResponse({
        source: 'nma',
        party: {
          id: party.id,
          name: party.name,
          title: party.title,
          description: party.description,
          birthDate: party.birthDate,
          deathDate: party.deathDate,
          birthPlace: party.birthPlace ? {
            id: party.birthPlace.id,
            title: party.birthPlace.title,
          } : undefined,
          deathPlace: party.deathPlace ? {
            id: party.deathPlace.id,
            title: party.deathPlace.title,
          } : undefined,
          nationality: party.nationality,
          gender: party.gender,
          metadata: {
            modified: party._meta?.modified,
            issued: party._meta?.issued,
            webUrl: party._meta?.hasFormat,
          },
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
