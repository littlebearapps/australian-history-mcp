/**
 * IIIF Get Manifest Tool
 *
 * Fetches and parses IIIF Presentation API manifests from any institution.
 * Returns structured data about the manifest including canvas/image information.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { iiifClient } from '../client.js';

export const iiifGetManifestTool: SourceTool = {
  schema: {
    name: 'iiif_get_manifest',
    description: `Fetch and parse an IIIF manifest from any IIIF-compliant institution.

Common manifest URL patterns:
- SLV: https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/{IE_ID}/manifest
- NLA: https://nla.gov.au/nla.obj-{ID}/manifest
- Bodleian: https://iiif.bodleian.ox.ac.uk/iiif/manifest/{ID}.json

Returns structured data including label, description, attribution, and canvas/image details.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        manifestUrl: {
          type: 'string',
          description: 'Full URL to the IIIF manifest (e.g., https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/IE145082/manifest)',
        },
        includeCanvases: {
          type: 'boolean',
          description: 'Include detailed canvas/image information (default: true)',
          default: true,
        },
        maxCanvases: {
          type: 'number',
          description: 'Maximum number of canvases to include in response (default: 50)',
          default: 50,
        },
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
