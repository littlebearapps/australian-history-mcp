/**
 * National Museum of Australia (NMA) Source Module
 *
 * Provides access to the museum's collection of objects, places, and media.
 * Optional API key for higher rate limits.
 *
 * No API key required for basic access.
 */

import { defineSource } from '../../core/base-source.js';
import { nmaSearchObjectsTool } from './tools/search-objects.js';
import { nmaGetObjectTool } from './tools/get-object.js';
import { nmaSearchPlacesTool } from './tools/search-places.js';
import { nmaGetPlaceTool } from './tools/get-place.js';
import { nmaSearchPartiesTool } from './tools/search-parties.js';
import { nmaGetPartyTool } from './tools/get-party.js';
import { nmaSearchMediaTool } from './tools/search-media.js';
import { nmaGetMediaTool } from './tools/get-media.js';
import { nmaHarvestTool } from './tools/harvest.js';

export const nmaSource = defineSource({
  name: 'nma',
  displayName: 'National Museum of Australia',
  description: 'Australian museum collection including objects, photographs, and historical artefacts.',
  requiresAuth: false,
  tools: [
    nmaSearchObjectsTool,
    nmaGetObjectTool,
    nmaSearchPlacesTool,
    nmaGetPlaceTool,
    nmaSearchPartiesTool,
    nmaGetPartyTool,
    nmaSearchMediaTool,
    nmaGetMediaTool,
    nmaHarvestTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { nmaClient } from './client.js';
