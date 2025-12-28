/**
 * GHAP Search Tool - Search historical Australian placenames
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { ghapClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { AU_STATES_UPPER } from '../../../core/enums.js';
import type { GHAPSearchParams } from '../types.js';
import { countFacets, simpleFacetConfig } from '../../../core/facets/index.js';

// Facet configuration for GHAP
const GHAP_FACET_CONFIGS = [
  simpleFacetConfig('state', 'State', 'state'),
  simpleFacetConfig('lga', 'Local Government Area', 'lga'),
  simpleFacetConfig('featureType', 'Feature Type', 'featureType'),
  simpleFacetConfig('source', 'Source', 'source'),
];

const GHAP_FACET_FIELDS = GHAP_FACET_CONFIGS.map(c => c.name);

export const ghapSearchTool: SourceTool = {
  schema: {
    name: 'ghap_search',
    description: 'Search historical Australian placenames with coordinates.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        fuzzy: { type: 'boolean', description: PARAMS.FUZZY, default: false },
        state: { type: 'string', description: PARAMS.STATE, enum: AU_STATES_UPPER },
        lga: { type: 'string', description: PARAMS.LGA },
        bbox: { type: 'string', description: PARAMS.BBOX },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
        // Faceted search
        includeFacets: { type: 'boolean', description: PARAMS.INCLUDE_FACETS, default: false },
        facetFields: { type: 'array', items: { type: 'string', enum: GHAP_FACET_FIELDS }, description: PARAMS.FACET_FIELDS },
        facetLimit: { type: 'number', description: PARAMS.FACET_LIMIT, default: 10 },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query: string;
      fuzzy?: boolean;
      state?: string;
      lga?: string;
      bbox?: string;
      limit?: number;
      // Faceted search
      includeFacets?: boolean;
      facetFields?: string[];
      facetLimit?: number;
    };

    if (!input.query || input.query.trim() === '') {
      return errorResponse('Query is required');
    }

    try {
      const params: GHAPSearchParams = {
        limit: Math.min(input.limit ?? 20, 100),
        state: input.state as GHAPSearchParams['state'],
        lga: input.lga,
        bbox: input.bbox,
      };

      // Use fuzzy or contains search
      if (input.fuzzy) {
        params.fuzzyname = input.query;
      } else {
        params.containsname = input.query;
      }

      const result = await ghapClient.search(params);

      // Build response with optional facets
      const response: Record<string, unknown> = {
        source: 'ghap',
        totalResults: result.totalResults,
        returned: result.places.length,
        places: result.places.map((p) => ({
          id: p.id,
          name: p.name,
          state: p.state,
          lga: p.lga,
          featureType: p.featureType,
          latitude: p.latitude,
          longitude: p.longitude,
          source: p.source,
          dateRange: p.dateRange,
          url: p.url,
        })),
      };

      // Add client-side facets if requested
      if (input.includeFacets && result.places.length > 0) {
        const facetResult = countFacets(
          result.places as unknown as Record<string, unknown>[],
          {
            facetConfigs: GHAP_FACET_CONFIGS,
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
