/**
 * Museums Victoria Search Tool - Search the museum collection
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { museumsVictoriaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { MV_RECORD_TYPES, MV_CATEGORIES, MV_LICENCES } from '../../../core/enums.js';
import type { MuseumSearchParams, MuseumRecord } from '../types.js';

export const museumsvicSearchTool: SourceTool = {
  schema: {
    name: 'museumsvic_search',
    description: 'Search museum objects, specimens, species, and articles.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        recordType: { type: 'string', description: PARAMS.RECORD_TYPE, enum: MV_RECORD_TYPES },
        category: { type: 'string', description: PARAMS.CATEGORY, enum: MV_CATEGORIES },
        hasImages: { type: 'boolean', description: PARAMS.HAS_IMAGES },
        onDisplay: { type: 'boolean', description: PARAMS.ON_DISPLAY },
        imageLicence: { type: 'string', description: 'Image licence', enum: MV_LICENCES },
        locality: { type: 'string', description: 'Collection locality' },
        taxon: { type: 'string', description: PARAMS.TAXON },
        random: { type: 'boolean', description: PARAMS.RANDOM, default: false },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      recordType?: string;
      category?: string;
      hasImages?: boolean;
      onDisplay?: boolean;
      imageLicence?: string;
      locality?: string;
      taxon?: string;
      random?: boolean;
      limit?: number;
    };

    // Validate at least one search criterion
    if (!input.query && !input.recordType && !input.category && !input.taxon && !input.locality) {
      return errorResponse('At least one search parameter is required (query, recordType, category, taxon, or locality)');
    }

    try {
      const params: MuseumSearchParams = {
        query: input.query,
        recordType: input.recordType as MuseumSearchParams['recordType'],
        category: input.category as MuseumSearchParams['category'],
        hasImages: input.hasImages,
        onDisplay: input.onDisplay,
        imageLicence: input.imageLicence as MuseumSearchParams['imageLicence'],
        locality: input.locality,
        taxon: input.taxon,
        random: input.random,
        perPage: Math.min(input.limit ?? 20, 100),
      };

      const result = await museumsVictoriaClient.search(params);

      return successResponse({
        source: 'museumsvic',
        totalResults: result.totalResults,
        returned: result.records.length,
        page: result.currentPage,
        totalPages: result.totalPages,
        records: result.records.map(r => formatRecordSummary(r)),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Format a record for search results (summary view)
 */
function formatRecordSummary(record: MuseumRecord) {
  const base = {
    id: record.id,
    type: record.recordType,
    title: record.displayTitle,
    modified: record.dateModified,
    hasImages: (record.media?.length ?? 0) > 0,
    imageCount: record.media?.length ?? 0,
  };

  switch (record.recordType) {
    case 'article':
      return {
        ...base,
        summary: record.contentSummary?.substring(0, 200),
        keywords: record.keywords?.slice(0, 5),
      };
    case 'item':
      return {
        ...base,
        objectName: record.objectName,
        summary: record.objectSummary?.substring(0, 200),
        category: record.category,
        registrationNumber: record.registrationNumber,
      };
    case 'species':
      return {
        ...base,
        taxonomy: record.taxonomy ? {
          commonName: record.taxonomy.commonName,
          scientificName: record.taxonomy.genus && record.taxonomy.species
            ? `${record.taxonomy.genus} ${record.taxonomy.species}`
            : undefined,
          family: record.taxonomy.family,
        } : undefined,
        summary: record.overview?.substring(0, 200),
      };
    case 'specimen':
      return {
        ...base,
        registrationNumber: record.registrationNumber,
        summary: record.objectSummary?.substring(0, 200),
        category: record.category,
        locality: record.collectionEvent?.locality,
      };
    default:
      return base;
  }
}
