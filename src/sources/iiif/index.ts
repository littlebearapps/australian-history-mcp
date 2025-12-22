/**
 * IIIF (International Image Interoperability Framework) Source Module
 *
 * Provides tools for working with IIIF-compliant image repositories
 * including manifest retrieval and image URL construction.
 *
 * Works with any institution implementing IIIF APIs including:
 * - State Library Victoria (rosetta.slv.vic.gov.au)
 * - National Library of Australia (nla.gov.au)
 * - Bodleian Libraries, Oxford
 * - Many other GLAM institutions worldwide
 *
 * No API key required.
 */

import { defineSource } from '../../core/base-source.js';
import { iiifGetManifestTool } from './tools/get-manifest.js';
import { iiifGetImageUrlTool } from './tools/get-image-url.js';

export const iiifSource = defineSource({
  name: 'iiif',
  displayName: 'IIIF (International Image Interoperability Framework)',
  description: 'Generic IIIF tools for fetching manifests and constructing image URLs from any IIIF-compliant institution.',
  requiresAuth: false,
  tools: [
    iiifGetManifestTool,
    iiifGetImageUrlTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { iiifClient } from './client.js';
