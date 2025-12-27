/**
 * ACMI List Creators Tool - List creators (directors, actors, studios)
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const acmiListCreatorsTool: SourceTool = {
  schema: {
    name: 'acmi_list_creators',
    description: 'List creators (directors, actors, studios).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: { type: 'number', description: PARAMS.PAGE },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { page?: number };

    try {
      const result = await acmiClient.listCreators(input.page ?? 1);

      return successResponse({
        source: 'acmi',
        totalResults: result.count,
        count: result.results.length,
        page: input.page ?? 1,
        creators: result.results.map((c) => {
          // Extract Wikidata ID if present
          const wikidataRef = c.external_references?.find(
            (ref) => ref.source?.slug === 'wikidata'
          );
          const wikidataId = wikidataRef?.source_identifier ?? null;

          return {
            id: c.id,
            name: c.name,
            alsoKnownAs: c.also_known_as || undefined,
            dateOfBirth: c.date_of_birth,
            dateOfDeath: c.date_of_death,
            biography: c.biography || undefined,
            wikidataId,
            worksCount: c.roles_in_work?.length ?? 0,
          };
        }),
        hasNext: !!result.next,
        hasPrevious: !!result.previous,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
