/**
 * VHD Search Places Tool - Search Victorian heritage places
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { vhdClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { countFacets, simpleFacetConfig } from '../../../core/facets/index.js';

// Facet configuration for VHD places
const VHD_FACET_CONFIGS = [
  simpleFacetConfig('municipality', 'Municipality', 'local_government_authority'),
  simpleFacetConfig('architecturalStyle', 'Architectural Style', 'architectural_style'),
  simpleFacetConfig('period', 'Period', 'period'),
  simpleFacetConfig('heritageAuthority', 'Heritage Authority', 'heritage_authority_name'),
];

const VHD_FACET_FIELDS = VHD_FACET_CONFIGS.map(c => c.name);

export const vhdSearchPlacesTool: SourceTool = {
  schema: {
    name: 'vhd_search_places',
    description: 'Search Victorian heritage places.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        municipality: { type: 'string', description: PARAMS.MUNICIPALITY },
        architecturalStyle: { type: 'string', description: PARAMS.ARCH_STYLE },
        period: { type: 'string', description: PARAMS.PERIOD },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
        // Faceted search
        includeFacets: { type: 'boolean', description: PARAMS.INCLUDE_FACETS, default: false },
        facetFields: { type: 'array', items: { type: 'string', enum: VHD_FACET_FIELDS }, description: PARAMS.FACET_FIELDS },
        facetLimit: { type: 'number', description: PARAMS.FACET_LIMIT, default: 10 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      municipality?: string;
      architecturalStyle?: string;
      period?: string;
      limit?: number;
      // Faceted search
      includeFacets?: boolean;
      facetFields?: string[];
      facetLimit?: number;
    };

    try {
      const result = await vhdClient.searchPlaces({
        query: input.query,
        municipality: input.municipality,
        architecturalStyle: input.architecturalStyle,
        period: input.period,
        limit: Math.min(input.limit ?? 20, 100),
      });

      const places = result._embedded?.places ?? [];

      // Build response with optional facets
      const response: Record<string, unknown> = {
        source: 'vhd',
        returned: places.length,
        places: places.map((place) => ({
          id: place.id,
          name: place.name,
          location: place.location,
          summary: place.summary?.substring(0, 300),
          heritageAuthority: place.heritage_authority_name,
          vhrNumber: place.vhr_number,
          overlays: place.overlay_numbers,
          coordinates: place.latlon,
          imageUrl: place.primary_image_url,
          url: place.url,
        })),
      };

      // Add client-side facets if requested
      if (input.includeFacets && places.length > 0) {
        const facetResult = countFacets(
          places as unknown as Record<string, unknown>[],
          {
            facetConfigs: VHD_FACET_CONFIGS,
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
