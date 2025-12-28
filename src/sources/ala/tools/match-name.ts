/**
 * ALA Match Name Tool - Match scientific names to ALA taxonomy
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const alaMatchNameTool: SourceTool = {
  schema: {
    name: 'ala_match_name',
    description: 'Match scientific name to ALA taxonomy.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        scientificName: { type: 'string', description: PARAMS.SCIENTIFIC_NAME },
      },
      required: ['scientificName'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { scientificName?: string };

    if (!input.scientificName) {
      return errorResponse('scientificName is required');
    }

    try {
      const result = await alaClient.matchName(input.scientificName);

      if (!result.success) {
        return successResponse({
          source: 'ala',
          success: false,
          message: 'No match found for the provided name',
          issues: result.issues,
        });
      }

      return successResponse({
        source: 'ala',
        success: true,
        match: {
          scientificName: result.scientificName,
          author: result.scientificNameAuthorship,
          taxonConceptID: result.taxonConceptID,
          rank: result.rank,
          matchType: result.matchType,
          nameType: result.nameType,
          synonymType: result.synonymType,
          vernacularName: result.vernacularName,
          classification: {
            kingdom: result.kingdom,
            phylum: result.phylum,
            class: result.classs,
            order: result.order,
            family: result.family,
            genus: result.genus,
            species: result.species,
          },
          issues: result.issues,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
