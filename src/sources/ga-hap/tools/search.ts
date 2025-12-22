/**
 * GA HAP Search Tool - Search historical aerial photographs
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { gaHapClient } from '../client.js';

export const gaHapSearchTool: SourceTool = {
  schema: {
    name: 'ga_hap_search',
    description:
      'Search Geoscience Australia Historical Aerial Photography (1928-1996). Returns photo records with preview and download URLs. CC-BY 4.0 licensed.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        state: {
          type: 'string',
          description: 'Australian state (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)',
          enum: ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
        },
        yearFrom: {
          type: 'number',
          description: 'Filter by start year (e.g., 1950)',
        },
        yearTo: {
          type: 'number',
          description: 'Filter by end year (e.g., 1970)',
        },
        scannedOnly: {
          type: 'boolean',
          description: 'Only return records with digitised images (default: false)',
          default: false,
        },
        filmNumber: {
          type: 'string',
          description: 'Filter by film number (e.g., "MAP2080")',
        },
        bbox: {
          type: 'string',
          description:
            'Bounding box filter: minLon,minLat,maxLon,maxLat in WGS84 (e.g., "144.9,-37.9,145.0,-37.8")',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (1-100, default 20)',
          default: 20,
        },
        offset: {
          type: 'number',
          description: 'Number of results to skip for pagination (default 0)',
          default: 0,
        },
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

      return successResponse({
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
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
