/**
 * NMA Search Objects Tool - Search museum collection objects
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { countFacets, simpleFacetConfig } from '../../../core/facets/index.js';

// Facet configuration for NMA objects
const NMA_FACET_CONFIGS = [
  simpleFacetConfig('type', 'Type', 'additionalType'),
  simpleFacetConfig('collection', 'Collection', 'collection.title'),
  simpleFacetConfig('medium', 'Material', 'medium.title'),
  simpleFacetConfig('spatial', 'Place', 'spatial.title'),
];

const NMA_FACET_FIELDS = NMA_FACET_CONFIGS.map(c => c.name);

export const nmaSearchObjectsTool: SourceTool = {
  schema: {
    name: 'nma_search_objects',
    description: 'Search museum collection objects.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        type: { type: 'string', description: PARAMS.TYPE },
        collection: { type: 'string', description: PARAMS.COLLECTION },
        // SEARCH-011: New filter parameters
        medium: { type: 'string', description: 'Material (e.g., Wood, Paper, Metal)' },
        spatial: { type: 'string', description: 'Place/location (e.g., Victoria, Queensland)' },
        year: { type: 'number', description: PARAMS.YEAR },
        creator: { type: 'string', description: PARAMS.CREATOR },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
        // Faceted search
        includeFacets: { type: 'boolean', description: PARAMS.INCLUDE_FACETS, default: false },
        facetFields: { type: 'array', items: { type: 'string', enum: NMA_FACET_FIELDS }, description: PARAMS.FACET_FIELDS },
        facetLimit: { type: 'number', description: PARAMS.FACET_LIMIT, default: 10 },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      type?: string;
      collection?: string;
      // SEARCH-011: New filter parameters
      medium?: string;
      spatial?: string;
      year?: number;
      creator?: string;
      limit?: number;
      // Faceted search
      includeFacets?: boolean;
      facetFields?: string[];
      facetLimit?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const result = await nmaClient.searchObjects({
        text: input.query,
        type: input.type,
        collection: input.collection,
        // SEARCH-011: New filter parameters
        medium: input.medium,
        spatial: input.spatial,
        temporal: input.year,
        creator: input.creator,
        limit: Math.min(input.limit ?? 20, 100),
      });

      // Build response with optional facets
      const response: Record<string, unknown> = {
        source: 'nma',
        totalResults: result.meta.results,
        returned: result.data.length,
        objects: result.data.map((obj) => ({
          id: obj.id,
          title: obj.title,
          type: obj.additionalType?.join(', '),
          collection: obj.collection?.title,
          identifier: obj.identifier,
          materials: obj.medium?.map((m) => m.title).join(', '),
          description: obj.physicalDescription?.substring(0, 300),
          location: obj.spatial?.[0]?.title,
          modified: obj._meta?.modified,
          licence: obj._meta?.licence,
          webUrl: obj._meta?.hasFormat,
        })),
      };

      // Add client-side facets if requested
      if (input.includeFacets && result.data.length > 0) {
        const facetResult = countFacets(
          result.data as unknown as Record<string, unknown>[],
          {
            facetConfigs: NMA_FACET_CONFIGS,
            includeFacets: input.facetFields,
            limit: input.facetLimit ?? 10,
          }
        );
        response.facets = Object.values(facetResult.facets);
      }

      return successResponse(response);
    } catch (error) {
      return errorResponse(error);
    }
  },
};
