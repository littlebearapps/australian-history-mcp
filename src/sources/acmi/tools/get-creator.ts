/**
 * ACMI Get Creator Tool - Get creator details by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const acmiGetCreatorTool: SourceTool = {
  schema: {
    name: 'acmi_get_creator',
    description: 'Get creator by ID.',
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
      const creator = await acmiClient.getCreator(input.id);

      if (!creator) {
        // ACMI API has a known issue where some creator IDs from list/works don't
        // resolve via the individual endpoint. The list endpoint already returns
        // full creator details, so use acmi_list_creators as a workaround.
        return errorResponse(
          `Creator not found: ${input.id}. Note: Some ACMI creator IDs are not accessible via the individual endpoint. ` +
          `Use acmi_list_creators() to browse creators with full details, or get creator info from acmi_get_work().`
        );
      }

      // Extract Wikidata ID if present
      const wikidataRef = creator.external_references?.find(
        (ref) => ref.source?.slug === 'wikidata'
      );
      const wikidataId = wikidataRef?.source_identifier ?? null;

      return successResponse({
        source: 'acmi',
        creator: {
          id: creator.id,
          name: creator.name,
          alsoKnownAs: creator.also_known_as || undefined,
          dateOfBirth: creator.date_of_birth,
          dateOfDeath: creator.date_of_death,
          biography: creator.biography || undefined,
          uuid: creator.uuid,
          wikidataId,
          wikidataUrl: wikidataId
            ? `https://www.wikidata.org/wiki/${wikidataId}`
            : undefined,
          acmiUrl: `https://www.acmi.net.au/creators/${creator.id}/`,
          works: creator.roles_in_work?.map((role) => ({
            id: role.work_id,
            title: role.title,
            role: role.role,
            isPrimary: role.is_primary,
          })) ?? [],
          worksCount: creator.roles_in_work?.length ?? 0,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
