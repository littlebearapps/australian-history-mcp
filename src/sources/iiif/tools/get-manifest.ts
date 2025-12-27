/**
 * IIIF Get Manifest Tool
 *
 * Fetches and parses IIIF Presentation API manifests from any institution.
 * Returns structured data about the manifest including canvas/image information.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { iiifClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const iiifGetManifestTool: SourceTool = {
  schema: {
    name: 'iiif_get_manifest',
    description: 'Fetch and parse IIIF manifest from any institution.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        manifestUrl: { type: 'string', description: PARAMS.MANIFEST_URL },
        includeCanvases: { type: 'boolean', description: PARAMS.INCLUDE_CANVASES, default: true },
        maxCanvases: { type: 'number', description: PARAMS.MAX_CANVASES, default: 50 },
      },
      required: ['manifestUrl'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      manifestUrl: string;
      includeCanvases?: boolean;
      maxCanvases?: number;
    };

    try {
      const manifest = await iiifClient.getManifest(input.manifestUrl);

      const includeCanvases = input.includeCanvases !== false;
      const maxCanvases = Math.min(input.maxCanvases ?? 50, 200);

      return successResponse({
        source: 'iiif',
        manifestUrl: input.manifestUrl,
        id: manifest.id,
        label: manifest.label,
        description: manifest.description,
        attribution: manifest.attribution,
        license: manifest.license,
        thumbnailUrl: manifest.thumbnailUrl,
        metadata: manifest.metadata,
        totalCanvases: manifest.totalCanvases,
        canvases: includeCanvases
          ? manifest.canvases.slice(0, maxCanvases).map((c) => ({
              id: c.id,
              label: c.label,
              width: c.width,
              height: c.height,
              thumbnailUrl: c.thumbnailUrl,
              imageServiceUrl: c.imageServiceUrl,
              // Construct full-size image URL if service is available
              fullImageUrl: c.imageServiceUrl
                ? iiifClient.constructImageUrl({
                    baseUrl: c.imageServiceUrl,
                    region: 'full',
                    size: 'max',
                    rotation: '0',
                    quality: 'default',
                    format: 'jpg',
                  })
                : c.imageUrl,
            }))
          : undefined,
        hasMoreCanvases: manifest.totalCanvases > maxCanvases,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
