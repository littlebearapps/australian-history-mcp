/**
 * Museums Victoria Search Tool - Search the museum collection
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { museumsVictoriaClient } from '../client.js';
import type { MuseumSearchParams, MuseumRecord } from '../types.js';

export const museumsvicSearchTool: SourceTool = {
  schema: {
    name: 'museumsvic_search',
    description: 'Search Museums Victoria for objects, specimens, species, and articles.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search terms',
        },
        recordType: {
          type: 'string',
          enum: ['article', 'item', 'species', 'specimen'],
          description: 'Type of record to search',
        },
        category: {
          type: 'string',
          enum: ['natural sciences', 'first peoples', 'history & technology'],
          description: 'Collection category',
        },
        hasImages: {
          type: 'boolean',
          description: 'Only return records with images',
        },
        onDisplay: {
          type: 'boolean',
          description: 'Only return items currently on display',
        },
        imageLicence: {
          type: 'string',
          enum: ['public domain', 'cc by', 'cc by-nc', 'cc by-sa', 'cc by-nc-sa'],
          description: 'Filter by image licence',
        },
        locality: {
          type: 'string',
          description: 'Filter by collection locality',
        },
        taxon: {
          type: 'string',
          description: 'Filter by taxonomic classification',
        },
        random: {
          type: 'boolean',
          description: 'Return results in random order (useful for discovering collection)',
          default: false,
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
