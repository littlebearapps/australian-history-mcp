/**
 * ALA Search Occurrences Tool - Search species occurrence records
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { alaClient } from '../client.js';
import type { ALAOccurrenceSearchParams, ALAOccurrence } from '../types.js';

export const alaSearchOccurrencesTool: SourceTool = {
  schema: {
    name: 'ala_search_occurrences',
    description: 'Search Atlas of Living Australia for species occurrence records. Returns sightings, specimens, and observations across Australia.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (taxon name, location, or keyword)',
        },
        scientificName: {
          type: 'string',
          description: 'Filter by scientific name',
        },
        vernacularName: {
          type: 'string',
          description: 'Filter by common name',
        },
        kingdom: {
          type: 'string',
          enum: ['Animalia', 'Plantae', 'Fungi', 'Chromista', 'Protozoa', 'Bacteria', 'Archaea', 'Viruses'],
          description: 'Filter by kingdom',
        },
        family: {
          type: 'string',
          description: 'Filter by taxonomic family',
        },
        genus: {
          type: 'string',
          description: 'Filter by genus',
        },
        stateProvince: {
          type: 'string',
          enum: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory'],
          description: 'Filter by state/territory',
        },
        startYear: {
          type: 'number',
          description: 'Filter by start year (e.g., 2020)',
        },
        endYear: {
          type: 'number',
          description: 'Filter by end year (e.g., 2024)',
        },
        hasImages: {
          type: 'boolean',
          description: 'Only return records with images',
        },
        spatiallyValid: {
          type: 'boolean',
          description: 'Only return records with valid coordinates',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (1-100)',
          default: 20,
        },
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
