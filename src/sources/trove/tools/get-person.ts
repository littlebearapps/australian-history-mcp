/**
 * Trove Get Person Tool - Get person/organisation biographical data by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { REC_LEVELS } from '../../../core/enums.js';
import type { TroveRecLevel } from '../types.js';

export const troveGetPersonTool: SourceTool = {
  schema: {
    name: 'trove_get_person',
    description: 'Get person/organisation biographical data.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        personId: { type: 'string', description: PARAMS.ID },
        reclevel: { type: 'string', description: PARAMS.RECLEVEL, enum: REC_LEVELS, default: 'full' },
      },
      required: ['personId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      personId?: string;
      reclevel?: TroveRecLevel;
    };

    if (!input.personId) {
      return errorResponse('personId is required');
    }

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    try {
      const person = await troveClient.getPerson(input.personId, {
        reclevel: input.reclevel || 'full',
      });

      if (!person) {
        return errorResponse(`Person not found: ${input.personId}`);
      }

      return successResponse({
        source: 'trove',
        person: {
          id: person.id,
          type: person.type,
          primaryName: person.primaryName,
          displayName: person.primaryDisplayName,
          alternateNames: person.alternateName,
          title: person.title,
          occupation: person.occupation,
          biography: person.biography,
          contributor: person.contributor,
          thumbnailUrl: person.thumbnailUrl,
          url: person.troveUrl,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
