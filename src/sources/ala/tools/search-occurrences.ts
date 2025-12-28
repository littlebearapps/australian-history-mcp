/**
 * ALA Search Occurrences Tool - Search species occurrence records
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { ALA_KINGDOMS, AU_STATES_FULL } from '../../../core/enums.js';
import type { ALAOccurrenceSearchParams, ALAOccurrence, ALAFacetField, ALASortOption, ALABasisOfRecord } from '../types.js';
import { ALA_FACET_FIELDS, ALA_SORT_OPTIONS, ALA_SORT_MAPPINGS, ALA_BASIS_OF_RECORD } from '../types.js';

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
        // New filters (SEARCH-015)
        basisOfRecord: { type: 'string', description: PARAMS.BASIS_OF_RECORD, enum: ALA_BASIS_OF_RECORD },
        coordinateUncertaintyMax: { type: 'number', description: PARAMS.COORDINATE_UNCERTAINTY },
        occurrenceStatus: { type: 'string', description: PARAMS.OCCURRENCE_STATUS, enum: ['present', 'absent'] },
        dataResourceName: { type: 'string', description: PARAMS.DATA_RESOURCE_NAME },
        collector: { type: 'string', description: PARAMS.COLLECTOR },
        sortby: { type: 'string', description: PARAMS.SORT_BY, enum: ALA_SORT_OPTIONS, default: 'relevance' },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
        // Faceted search
        includeFacets: { type: 'boolean', description: PARAMS.INCLUDE_FACETS, default: false },
        facetFields: { type: 'array', items: { type: 'string', enum: ALA_FACET_FIELDS }, description: PARAMS.FACET_FIELDS },
        facetLimit: { type: 'number', description: PARAMS.FACET_LIMIT, default: 10 },
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
      // New filters (SEARCH-015)
      basisOfRecord?: ALABasisOfRecord;
      coordinateUncertaintyMax?: number;
      occurrenceStatus?: 'present' | 'absent';
      dataResourceName?: string;
      collector?: string;
      sortby?: ALASortOption;
      limit?: number;
      // Faceted search
      includeFacets?: boolean;
      facetFields?: ALAFacetField[];
      facetLimit?: number;
    };

    // Validate at least one search criterion
    const hasFilter = input.query || input.scientificName || input.vernacularName ||
      input.kingdom || input.family || input.genus || input.stateProvince;

    if (!hasFilter) {
      return errorResponse('At least one search parameter is required (query, scientificName, vernacularName, kingdom, family, genus, or stateProvince)');
    }

    try {
      // Map sortby to ALA API parameters
      const sortMapping = input.sortby ? ALA_SORT_MAPPINGS[input.sortby] : null;

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
        // New filters (SEARCH-015)
        basisOfRecord: input.basisOfRecord,
        coordinateUncertaintyMax: input.coordinateUncertaintyMax,
        occurrenceStatus: input.occurrenceStatus,
        dataResourceName: input.dataResourceName,
        collector: input.collector,
        sort: sortMapping?.sort as ALAOccurrenceSearchParams['sort'],
        dir: sortMapping?.dir as ALAOccurrenceSearchParams['dir'],
        pageSize: Math.min(input.limit ?? 20, 100),
        // Faceted search
        includeFacets: input.includeFacets,
        facetFields: input.facetFields,
        facetLimit: input.facetLimit,
      };

      const result = await alaClient.searchOccurrences(params);

      // Build response with optional facets
      const response: Record<string, unknown> = {
        source: 'ala',
        totalRecords: result.totalRecords,
        returned: result.occurrences.length,
        startIndex: result.startIndex,
        pageSize: result.pageSize,
        records: result.occurrences.map((occ) => formatOccurrenceSummary(occ)),
      };

      // Add facets if requested and available
      if (input.includeFacets && result.facets && result.facets.length > 0) {
        response.facets = result.facets;
      }

      return successResponse(response);
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
