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
import type { GAHAPSortOption, GAHAPFilmType } from '../types.js';
import { GAHAP_SORT_OPTIONS, GAHAP_FILM_TYPES } from '../types.js';

// Facet configuration for GA HAP
const GA_HAP_FACET_CONFIGS = [
  simpleFacetConfig('state', 'State', 'stateName'),
  simpleFacetConfig('filmType', 'Film Type', 'filmType'),
  simpleFacetConfig('camera', 'Camera', 'camera'),
];

const GA_HAP_FACET_FIELDS = ['state', 'filmType', 'camera', 'decade'];

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
        // SEARCH-016: Spatial query support
        lat: { type: 'number', description: PARAMS.LAT },
        lon: { type: 'number', description: PARAMS.LON },
        radiusKm: { type: 'number', description: PARAMS.RADIUS_KM },
        sortby: { type: 'string', description: PARAMS.SORT_BY, enum: GAHAP_SORT_OPTIONS, default: 'relevance' },
        // SEARCH-013: Technical filters
        filmType: { type: 'string', description: 'Film type (bw=Black/White, colour, bw-infrared, colour-infrared, infrared)', enum: GAHAP_FILM_TYPES },
        camera: { type: 'string', description: 'Camera model filter (partial match, e.g., "Williamson")' },
        scaleMin: { type: 'number', description: 'Min scale denominator (e.g., 10000 for 1:10000 or more detailed)' },
        scaleMax: { type: 'number', description: 'Max scale denominator (e.g., 50000 for 1:50000 or less detailed)' },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
        offset: { type: 'number', description: PARAMS.OFFSET, default: 0 },
        // Faceted search (SEARCH-013: added camera facet)
        includeFacets: { type: 'boolean', description: PARAMS.INCLUDE_FACETS, default: false },
        facetFields: { type: 'array', items: { type: 'string', enum: GA_HAP_FACET_FIELDS as unknown as string[] }, description: PARAMS.FACET_FIELDS },
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
      // SEARCH-016: Spatial query support
      lat?: number;
      lon?: number;
      radiusKm?: number;
      sortby?: GAHAPSortOption;
      // SEARCH-013: Technical filters
      filmType?: GAHAPFilmType;
      camera?: string;
      scaleMin?: number;
      scaleMax?: number;
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
        // SEARCH-016: Spatial query support
        lat: input.lat,
        lon: input.lon,
        radiusKm: input.radiusKm,
        sortby: input.sortby,
        // SEARCH-013: Technical filters
        filmType: input.filmType,
        camera: input.camera,
        scaleMin: input.scaleMin,
        scaleMax: input.scaleMax,
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
          camera: photo.camera,
          scale: photo.averageScale ? `1:${photo.averageScale}` : undefined,
          height: photo.averageHeight,
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
        if (facetFieldsToInclude.includes('state') || facetFieldsToInclude.includes('filmType') || facetFieldsToInclude.includes('camera')) {
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
