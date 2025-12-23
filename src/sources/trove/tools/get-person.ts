/**
 * Trove Get Person Tool - Get person/organisation biographical data by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import type { TroveRecLevel } from '../types.js';

export const troveGetPersonTool: SourceTool = {
  schema: {
    name: 'trove_get_person',
    description: 'Get detailed information about a person, organisation, or family in Trove by ID. Returns biographical data including names, occupation, and biography.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        personId: {
          type: 'string',
          description: 'The Trove people ID (e.g., "12345678")',
        },
        reclevel: {
          type: 'string',
          enum: ['brief', 'full'],
          default: 'full',
          description: 'Record detail level: "brief" for basic metadata, "full" for extended details',
        },
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
