/**
 * GA HAP Get Photo Tool - Get detailed photo record
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { gaHapClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const gaHapGetPhotoTool: SourceTool = {
  schema: {
    name: 'ga_hap_get_photo',
    description: 'Get aerial photo by ID or film/run/frame.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        objectId: { type: 'number', description: PARAMS.OBJECT_ID },
        filmNumber: { type: 'string', description: PARAMS.FILM_NUMBER },
        run: { type: 'string', description: PARAMS.RUN },
        frame: { type: 'string', description: PARAMS.FRAME },
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
