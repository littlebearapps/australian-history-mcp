/**
 * ALA Search Species Tool - Search for species by name
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import type { ALASpeciesSearchParams } from '../types.js';

export const alaSearchSpeciesTool: SourceTool = {
  schema: {
    name: 'ala_search_species',
    description: 'Search species by scientific or common name.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      limit?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const params: ALASpeciesSearchParams = {
        q: input.query,
        max: Math.min(input.limit ?? 20, 100),
      };

      const result = await alaClient.searchSpecies(params);

      return successResponse({
        source: 'ala',
        totalRecords: result.searchResults.totalRecords,
        returned: result.searchResults.results.length,
        startIndex: result.searchResults.startIndex,
        species: result.searchResults.results.map((s) => ({
          guid: s.guid,
          scientificName: s.scientificName,
          commonName: s.commonName,
          author: s.author,
          rank: s.rank,
          taxonomicStatus: s.taxonomicStatus,
          taxonomy: {
            kingdom: s.kingdom,
            phylum: s.phylum,
            class: s.classs,
            order: s.order,
            family: s.family,
            genus: s.genus,
          },
          occurrenceCount: s.occurrenceCount,
          hasImage: !!s.imageUrl,
          thumbnailUrl: s.thumbnailUrl,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
