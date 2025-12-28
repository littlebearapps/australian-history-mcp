/**
 * GA HAP Search Tool - Search historical aerial photographs
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { gaHapClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { AU_STATES } from '../../../core/enums.js';
import { countFacets, simpleFacetConfig, countByDecade } from '../../../core/facets/index.js';
import type { Facet } from '../../../core/facets/types.js';

// Facet configuration for GA HAP
const GA_HAP_FACET_CONFIGS = [
  simpleFacetConfig('state', 'State', 'stateName'),
  simpleFacetConfig('filmType', 'Film Type', 'filmType'),
];

const GA_HAP_FACET_FIELDS = ['state', 'filmType', 'decade'];

export const gaHapSearchTool: SourceTool = {
  schema: {
    name: 'ga_hap_search',
    description: 'Search historical aerial photos (1928-1996).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        state: { type: 'string', description: PARAMS.STATE, enum: AU_STATES },
        yearFrom: { type: 'number', description: PARAMS.YEAR_FROM },
        yearTo: { type: 'number', description: PARAMS.YEAR_TO },
        scannedOnly: { type: 'boolean', description: PARAMS.SCANNED_ONLY, default: false },
        filmNumber: { type: 'string', description: PARAMS.FILM_NUMBER },
        bbox: { type: 'string', description: PARAMS.BBOX },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
        offset: { type: 'number', description: PARAMS.OFFSET, default: 0 },
        // Faceted search
        includeFacets: { type: 'boolean', description: PARAMS.INCLUDE_FACETS, default: false },
        facetFields: { type: 'array', items: { type: 'string', enum: GA_HAP_FACET_FIELDS }, description: PARAMS.FACET_FIELDS },
        facetLimit: { type: 'number', description: PARAMS.FACET_LIMIT, default: 10 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      state?: string;
      yearFrom?: number;
      yearTo?: number;
      scannedOnly?: boolean;
      filmNumber?: string;
      bbox?: string;
      limit?: number;
      offset?: number;
      // Faceted search
      includeFacets?: boolean;
      facetFields?: string[];
      facetLimit?: number;
    };

    try {
      const result = await gaHapClient.searchPhotos({
        state: input.state,
        yearFrom: input.yearFrom,
        yearTo: input.yearTo,
        scannedOnly: input.scannedOnly ?? false,
        filmNumber: input.filmNumber,
        bbox: input.bbox,
        limit: Math.min(input.limit ?? 20, 100),
        offset: input.offset ?? 0,
      });

      // Build response with optional facets
      const response: Record<string, unknown> = {
        source: 'ga-hap',
        returned: result.photos.length,
        offset: result.offset,
        limit: result.limit,
        hasMore: result.hasMore,
        photos: result.photos.map((photo) => ({
          objectId: photo.objectId,
          filmNumber: photo.filmNumber,
          run: photo.run,
          frame: photo.frame,
          yearRange:
            photo.yearStart && photo.yearEnd
              ? `${photo.yearStart}-${photo.yearEnd}`
              : photo.yearStart?.toString() ?? photo.yearEnd?.toString(),
          state: photo.stateName ?? photo.stateCode,
          filmType: photo.filmType,
          scale: photo.averageScale ? `1:${photo.averageScale}` : undefined,
          scanned: photo.scanned,
          previewUrl: photo.previewUrl,
          downloadUrl: photo.tifUrl,
          coordinates:
            photo.latitude && photo.longitude
              ? { lat: photo.latitude, lon: photo.longitude }
              : undefined,
        })),
      };

      // Add client-side facets if requested
      if (input.includeFacets && result.photos.length > 0) {
        const facets: Facet[] = [];
        const facetFieldsToInclude = input.facetFields ?? GA_HAP_FACET_FIELDS;

        // Standard facets
        if (facetFieldsToInclude.includes('state') || facetFieldsToInclude.includes('filmType')) {
          const facetResult = countFacets(
            result.photos as unknown as Record<string, unknown>[],
            {
              facetConfigs: GA_HAP_FACET_CONFIGS,
              includeFacets: facetFieldsToInclude.filter(f => f !== 'decade'),
              limit: input.facetLimit ?? 10,
            }
          );
          facets.push(...Object.values(facetResult.facets));
        }

        // Decade facet (special handling for year fields)
        if (facetFieldsToInclude.includes('decade')) {
          const decadeValues = countByDecade(
            result.photos as unknown as Record<string, unknown>[],
            'yearStart'
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
