/**
 * Victorian Heritage Database (VHD) Source Module
 *
 * Provides access to Victorian heritage places, shipwrecks, and objects.
 * CC-BY 4.0 licensed data.
 *
 * No API key required.
 */

import { defineSource } from '../../core/base-source.js';
import { vhdSearchPlacesTool } from './tools/search-places.js';
import { vhdGetPlaceTool } from './tools/get-place.js';
import { vhdSearchShipwrecksTool } from './tools/search-shipwrecks.js';
import { vhdGetShipwreckTool } from './tools/get-shipwreck.js';
import { vhdListMunicipalitiesTool } from './tools/list-municipalities.js';
import { vhdListArchitecturalStylesTool } from './tools/list-architectural-styles.js';
import { vhdListThemesTool } from './tools/list-themes.js';
import { vhdListPeriodsTool } from './tools/list-periods.js';
import { vhdHarvestTool } from './tools/harvest.js';

export const vhdSource = defineSource({
  name: 'vhd',
  displayName: 'Victorian Heritage Database',
  description: 'Victorian heritage places, shipwrecks, and heritage inventory sites.',
  requiresAuth: false,
  tools: [
    vhdSearchPlacesTool,
    vhdGetPlaceTool,
    vhdSearchShipwrecksTool,
    vhdGetShipwreckTool,
    vhdListMunicipalitiesTool,
    vhdListArchitecturalStylesTool,
    vhdListThemesTool,
    vhdListPeriodsTool,
    vhdHarvestTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { vhdClient } from './client.js';
