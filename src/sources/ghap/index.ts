/**
 * GHAP (Gazetteer of Historical Australian Placenames) Source Module
 *
 * Provides access to historical placenames from the Australian National
 * Placename Survey (ANPS) and community-contributed TLCMap layers.
 *
 * No API key required.
 */

import { defineSource } from '../../core/base-source.js';
import { ghapSearchTool } from './tools/search.js';
import { ghapGetPlaceTool } from './tools/get-place.js';
import { ghapListLayersTool } from './tools/list-layers.js';
import { ghapGetLayerTool } from './tools/get-layer.js';
import { ghapHarvestTool } from './tools/harvest.js';

export const ghapSource = defineSource({
  name: 'ghap',
  displayName: 'Gazetteer of Historical Australian Placenames',
  description: 'Historical placenames with coordinates from ANPS gazetteer and community-contributed datasets via TLCMap.',
  requiresAuth: false,
  tools: [
    ghapSearchTool,
    ghapGetPlaceTool,
    ghapListLayersTool,
    ghapGetLayerTool,
    ghapHarvestTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { ghapClient } from './client.js';
