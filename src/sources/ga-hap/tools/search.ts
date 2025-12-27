/**
 * GA HAP Search Tool - Search historical aerial photographs
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { gaHapClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { AU_STATES } from '../../../core/enums.js';

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
