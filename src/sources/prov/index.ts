/**
 * PROV (Public Record Office Victoria) Source Module
 *
 * Provides access to Victorian state government archives
 * through the PROV Solr-based search API.
 *
 * No API key required (CC-BY-NC license).
 */

import { defineSource } from '../../core/base-source.js';
import { provSearchTool } from './tools/search.js';
import { provGetImagesTool } from './tools/images.js';
import { provHarvestTool } from './tools/harvest.js';

export const provSource = defineSource({
  name: 'prov',
  displayName: 'Public Record Office Victoria',
  description: 'Victorian state government archives including photographs, maps, government files, and council records.',
  requiresAuth: false,
  tools: [
    provSearchTool,
    provGetImagesTool,
    provHarvestTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { provClient } from './client.js';
