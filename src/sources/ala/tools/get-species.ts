/**
 * ALA Get Species Tool - Get detailed species profile by GUID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const alaGetSpeciesTool: SourceTool = {
  schema: {
    name: 'ala_get_species',
    description: 'Get species profile by GUID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        guid: { type: 'string', description: PARAMS.GUID },
      },
      required: ['guid'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { guid?: string };

    if (!input.guid) {
      return errorResponse('guid is required');
    }

    try {
      const profile = await alaClient.getSpeciesProfile(input.guid);

      if (!profile) {
        return errorResponse(`Species not found: ${input.guid}`);
      }

      const taxon = profile.taxonConcept;

      return successResponse({
        source: 'ala',
        species: {
          guid: taxon.guid,
          scientificName: taxon.scientificName,
          author: taxon.author,
          commonName: taxon.commonName,
          rank: taxon.rank,
          taxonomicStatus: taxon.taxonomicStatus,
          taxonomy: {
            kingdom: taxon.kingdom,
            phylum: taxon.phylum,
            class: taxon.classs,
            order: taxon.order,
            family: taxon.family,
            genus: taxon.genus,
          },
          occurrenceCount: taxon.occurrenceCount,
          imageUrl: taxon.imageUrl,
        },
        commonNames: profile.commonNames?.map((n) => ({
          name: n.nameString,
          status: n.status,
        })),
        synonyms: profile.synonyms?.map((s) => ({
          name: s.nameString,
          author: s.author,
        })),
        images: profile.images?.map((img) => ({
          id: img.imageId,
          title: img.title,
          creator: img.creator,
          license: img.license,
          thumbnailUrl: img.thumbnailUrl,
          largeImageUrl: img.largeImageUrl,
        })),
        conservationStatuses: profile.conservationStatuses?.map((cs) => ({
          status: cs.status,
          region: cs.region,
          system: cs.system,
        })),
        habitats: profile.habitats,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
