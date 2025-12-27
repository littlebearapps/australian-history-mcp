/**
 * ALA Search Occurrences Tool - Search species occurrence records
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { ALA_KINGDOMS, AU_STATES_FULL } from '../../../core/enums.js';
import type { ALAOccurrenceSearchParams, ALAOccurrence } from '../types.js';

export const alaSearchOccurrencesTool: SourceTool = {
  schema: {
    name: 'ala_search_occurrences',
    description: 'Search species occurrences (sightings, specimens, observations).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        scientificName: { type: 'string', description: PARAMS.SCIENTIFIC_NAME },
        vernacularName: { type: 'string', description: PARAMS.VERNACULAR_NAME },
        kingdom: { type: 'string', description: PARAMS.KINGDOM, enum: ALA_KINGDOMS },
        family: { type: 'string', description: PARAMS.FAMILY },
        genus: { type: 'string', description: PARAMS.GENUS },
        stateProvince: { type: 'string', description: PARAMS.STATE_FULL, enum: AU_STATES_FULL },
        startYear: { type: 'number', description: PARAMS.YEAR_FROM },
        endYear: { type: 'number', description: PARAMS.YEAR_TO },
        hasImages: { type: 'boolean', description: PARAMS.HAS_IMAGES },
        spatiallyValid: { type: 'boolean', description: PARAMS.SPATIALLY_VALID },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      scientificName?: string;
      vernacularName?: string;
      kingdom?: string;
      family?: string;
      genus?: string;
      stateProvince?: string;
      startYear?: number;
      endYear?: number;
      hasImages?: boolean;
      spatiallyValid?: boolean;
      limit?: number;
    };

    // Validate at least one search criterion
    const hasFilter = input.query || input.scientificName || input.vernacularName ||
      input.kingdom || input.family || input.genus || input.stateProvince;

    if (!hasFilter) {
      return errorResponse('At least one search parameter is required (query, scientificName, vernacularName, kingdom, family, genus, or stateProvince)');
    }

    try {
      const params: ALAOccurrenceSearchParams = {
        q: input.query,
        scientificName: input.scientificName,
        vernacularName: input.vernacularName,
        kingdom: input.kingdom,
        family: input.family,
        genus: input.genus,
        stateProvince: input.stateProvince,
        startYear: input.startYear,
        endYear: input.endYear,
        hasImages: input.hasImages,
        spatiallyValid: input.spatiallyValid,
        pageSize: Math.min(input.limit ?? 20, 100),
      };

      const result = await alaClient.searchOccurrences(params);

      return successResponse({
        source: 'ala',
        totalRecords: result.totalRecords,
        returned: result.occurrences.length,
        startIndex: result.startIndex,
        pageSize: result.pageSize,
        records: result.occurrences.map((occ) => formatOccurrenceSummary(occ)),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Format an occurrence for search results (summary view)
 */
function formatOccurrenceSummary(occ: ALAOccurrence) {
  return {
    uuid: occ.uuid,
    scientificName: occ.scientificName,
    vernacularName: occ.vernacularName,
    kingdom: occ.kingdom,
    family: occ.family,
    genus: occ.genus,
    location: {
      state: occ.stateProvince,
      country: occ.country,
      latitude: occ.decimalLatitude,
      longitude: occ.decimalLongitude,
    },
    date: occ.year ? {
      year: occ.year,
      month: occ.month,
    } : undefined,
    basisOfRecord: occ.basisOfRecord,
    dataSource: occ.dataResourceName,
    hasImage: !!occ.imageUrl,
    thumbnailUrl: occ.thumbnailUrl,
    license: occ.license,
  };
}
