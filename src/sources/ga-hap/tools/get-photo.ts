/**
 * GA HAP Get Photo Tool - Get detailed photo record
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { gaHapClient } from '../client.js';

export const gaHapGetPhotoTool: SourceTool = {
  schema: {
    name: 'ga_hap_get_photo',
    description:
      'Get detailed information about a specific historical aerial photograph by OBJECTID or film/run/frame. Returns full metadata and download URLs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        objectId: {
          type: 'number',
          description: 'ArcGIS OBJECTID (from search results)',
        },
        filmNumber: {
          type: 'string',
          description: 'Film number (e.g., "MAP2080"). Use with run and frame.',
        },
        run: {
          type: 'string',
          description: 'Run identifier (e.g., "1", "COAST TIE 2"). Use with filmNumber and frame.',
        },
        frame: {
          type: 'string',
          description: 'Frame identifier (e.g., "80", "5014"). Use with filmNumber and run.',
        },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      objectId?: number;
      filmNumber?: string;
      run?: string;
      frame?: string;
    };

    // Validate input
    if (input.objectId === undefined) {
      if (!input.filmNumber || input.run === undefined || input.frame === undefined) {
        return errorResponse(
          new Error(
            'Either objectId OR filmNumber+run+frame must be provided'
          )
        );
      }
    }

    try {
      const photo = await gaHapClient.getPhoto({
        objectId: input.objectId,
        filmNumber: input.filmNumber,
        run: input.run,
        frame: input.frame,
      });

      if (!photo) {
        return successResponse({
          source: 'ga-hap',
          found: false,
          message: 'Photo not found',
        });
      }

      return successResponse({
        source: 'ga-hap',
        found: true,
        photo: {
          objectId: photo.objectId,
          filmNumber: photo.filmNumber,
          run: photo.run,
          frame: photo.frame,
          dateStart: photo.dateStart,
          dateEnd: photo.dateEnd,
          yearStart: photo.yearStart,
          yearEnd: photo.yearEnd,
          stateCode: photo.stateCode,
          stateName: photo.stateName,
          camera: photo.camera,
          focalLength: photo.focalLength,
          averageHeight: photo.averageHeight,
          scale: photo.averageScale ? `1:${photo.averageScale}` : undefined,
          filmType: photo.filmType,
          scanned: photo.scanned,
          previewUrl: photo.previewUrl,
          downloadUrl: photo.tifUrl,
          fileSize: photo.fileSize,
          coordinates:
            photo.latitude && photo.longitude
              ? { lat: photo.latitude, lon: photo.longitude }
              : undefined,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
