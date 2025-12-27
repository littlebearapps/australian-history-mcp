/**
 * GA HAP Harvest Tool - Bulk download photo records
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { gaHapClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { AU_STATES } from '../../../core/enums.js';

export const gaHapHarvestTool: SourceTool = {
  schema: {
    name: 'ga_hap_harvest',
    description: 'Bulk download aerial photo records.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        state: { type: 'string', description: PARAMS.STATE, enum: AU_STATES },
        yearFrom: { type: 'number', description: PARAMS.YEAR_FROM },
        yearTo: { type: 'number', description: PARAMS.YEAR_TO },
        scannedOnly: { type: 'boolean', description: PARAMS.SCANNED_ONLY, default: false },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
        startFrom: { type: 'number', description: PARAMS.START_FROM, default: 0 },
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
      maxRecords?: number;
      startFrom?: number;
    };

    try {
      const result = await gaHapClient.harvest({
        state: input.state,
        yearFrom: input.yearFrom,
        yearTo: input.yearTo,
        scannedOnly: input.scannedOnly ?? false,
        maxRecords: Math.min(input.maxRecords ?? 100, 1000),
        startFrom: input.startFrom ?? 0,
      });

      return successResponse({
        source: 'ga-hap',
        harvested: result.records.length,
        startFrom: input.startFrom ?? 0,
        hasMore: result.hasMore,
        nextOffset: result.hasMore ? result.nextOffset : undefined,
        records: result.records.map((photo) => ({
          objectId: photo.objectId,
          filmNumber: photo.filmNumber,
          run: photo.run,
          frame: photo.frame,
          yearStart: photo.yearStart,
          yearEnd: photo.yearEnd,
          state: photo.stateName ?? photo.stateCode,
          filmType: photo.filmType,
          scale: photo.averageScale ? `1:${photo.averageScale}` : undefined,
          scanned: photo.scanned,
          previewUrl: photo.previewUrl,
          downloadUrl: photo.tifUrl,
          fileSize: photo.fileSize,
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
