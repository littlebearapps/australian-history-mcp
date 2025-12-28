/**
 * ACMI Search Works Tool - Search moving image collection
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { countFacets, simpleFacetConfig, countByDecade } from '../../../core/facets/index.js';
import type { Facet } from '../../../core/facets/types.js';

// Facet configuration for ACMI works
const ACMI_FACET_CONFIGS = [
  simpleFacetConfig('type', 'Type', 'type'),
  simpleFacetConfig('productionPlace', 'Production Place', 'production_places'),
];

const ACMI_FACET_FIELDS = ['type', 'productionPlace', 'decade'];

export const acmiSearchWorksTool: SourceTool = {
  schema: {
    name: 'acmi_search_works',
    description: 'Search films, TV, videogames, and digital art.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        type: { type: 'string', description: PARAMS.TYPE },
        year: { type: 'number', description: PARAMS.YEAR },
        // SEARCH-012: New filter parameters
        field: { type: 'string', description: 'Limit search to field (e.g., title)', enum: ['title', 'description'] },
        size: { type: 'number', description: 'Results per page (default 20, max 50)' },
        page: { type: 'number', description: PARAMS.PAGE, default: 1 },
        // Faceted search
        includeFacets: { type: 'boolean', description: PARAMS.INCLUDE_FACETS, default: false },
        facetFields: { type: 'array', items: { type: 'string', enum: ACMI_FACET_FIELDS }, description: PARAMS.FACET_FIELDS },
        facetLimit: { type: 'number', description: PARAMS.FACET_LIMIT, default: 10 },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      type?: string;
      year?: number;
      // SEARCH-012: New filter parameters
      field?: string;
      size?: number;
      page?: number;
      // Faceted search
      includeFacets?: boolean;
      facetFields?: string[];
      facetLimit?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const result = await acmiClient.searchWorks({
        query: input.query,
        type: input.type,
        year: input.year,
        // SEARCH-012: New filter parameters
        field: input.field,
        size: input.size,
        page: input.page ?? 1,
      });

      // Build response with optional facets
      const response: Record<string, unknown> = {
        source: 'acmi',
        totalResults: result.count,
        returned: result.results.length,
        hasNextPage: result.next !== null,
        works: result.results.map((work) => ({
          id: work.id,
          acmiId: work.acmi_id,
          title: work.title,
          type: work.type,
          slug: work.slug,
          creatorCredit: work.creator_credit,
          headlineCredit: work.headline_credit,
          description: work.brief_description?.substring(0, 300),
          productionYear: work.production_dates?.[0]?.date,
          productionPlace: work.production_places?.[0]?.name,
          isOnDisplay: work.is_on_display,
          isIndigenousContext: work.is_context_indigenous,
          webUrl: `https://www.acmi.net.au/works/${work.id}--${work.slug}/`,
        })),
      };

      // Add client-side facets if requested
      if (input.includeFacets && result.results.length > 0) {
        const facets: Facet[] = [];
        const facetFieldsToInclude = input.facetFields ?? ACMI_FACET_FIELDS;

        // Standard facets
        if (facetFieldsToInclude.includes('type') || facetFieldsToInclude.includes('productionPlace')) {
          const facetResult = countFacets(
            result.results as unknown as Record<string, unknown>[],
            {
              facetConfigs: ACMI_FACET_CONFIGS,
              includeFacets: facetFieldsToInclude.filter(f => f !== 'decade'),
              limit: input.facetLimit ?? 10,
            }
          );
          facets.push(...Object.values(facetResult.facets));
        }

        // Decade facet (special handling)
        if (facetFieldsToInclude.includes('decade')) {
          const decadeValues = countByDecade(
            result.results as unknown as Record<string, unknown>[],
            'production_dates.0.date'
          );
          if (decadeValues.length > 0) {
            const limitedValues = decadeValues.slice(0, input.facetLimit ?? 10);
            facets.push({
              name: 'decade',
              displayName: 'Decade',
              values: limitedValues,
              total: limitedValues.reduce((sum, v) => sum + v.count, 0),
            });
          }
        }

        if (facets.length > 0) {
          response.facets = facets;
        }
      }

      return successResponse(response);
    } catch (error) {
      return errorResponse(error);
    }
  },
};
