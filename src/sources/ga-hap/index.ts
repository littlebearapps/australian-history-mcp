/**
 * Geoscience Australia Historical Aerial Photography (GA HAP) Source Module
 *
 * Provides access to 1.2 million+ historical aerial photographs from 1928-1996.
 * Covers all Australian states and territories.
 *
 * No API key required. CC-BY 4.0 licensed.
 */

import { defineSource } from '../../core/base-source.js';
import { gaHapSearchTool } from './tools/search.js';
import { gaHapGetPhotoTool } from './tools/get-photo.js';
import { gaHapHarvestTool } from './tools/harvest.js';

export const gaHapSource = defineSource({
  name: 'ga-hap',
  displayName: 'Geoscience Australia Historical Aerial Photography',
  description:
    'Commonwealth historical aerial photography collection (1928-1996). 1.2M+ photos.',
  requiresAuth: false,
  tools: [gaHapSearchTool, gaHapGetPhotoTool, gaHapHarvestTool],
});

// Re-export types and client for external use
export * from './types.js';
export { gaHapClient } from './client.js';
