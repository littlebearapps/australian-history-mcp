/**
 * Trove (National Library of Australia) Source Module
 *
 * Provides access to the National Library's digitised collections
 * including newspapers, books, images, maps, and more.
 *
 * Requires API key (TROVE_API_KEY environment variable).
 */

import { defineSource } from '../../core/base-source.js';
import { troveSearchTool } from './tools/search.js';
import {
  troveNewspaperArticleTool,
  troveListTitlesTool,
  troveTitleDetailsTool,
} from './tools/newspaper.js';
import { troveHarvestTool } from './tools/harvest.js';

export const troveSource = defineSource({
  name: 'trove',
  displayName: 'Trove (National Library of Australia)',
  description: 'Federal digitised collections including newspapers, books, images, maps, and government gazettes.',
  requiresAuth: true,
  authEnvVar: 'TROVE_API_KEY',
  checkAuth: () => !!process.env.TROVE_API_KEY,
  tools: [
    troveSearchTool,
    troveNewspaperArticleTool,
    troveListTitlesTool,
    troveTitleDetailsTool,
    troveHarvestTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { troveClient } from './client.js';
