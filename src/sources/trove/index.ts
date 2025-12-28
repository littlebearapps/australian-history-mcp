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
import { troveGetContributorTool } from './tools/get-contributor.js';
import { troveListMagazineTitlesTool } from './tools/list-magazine-titles.js';
// New Phase 1-3 tools
import { troveGetWorkTool } from './tools/get-work.js';
import { troveListContributorsTool } from './tools/list-contributors.js';
import { troveGetMagazineTitleTool } from './tools/get-magazine-title.js';
import { troveGetPersonTool } from './tools/get-person.js';
import { troveGetListTool } from './tools/get-list.js';
import { troveSearchPeopleTool } from './tools/search-people.js';
import { troveGetVersionsTool } from './tools/get-versions.js';

export const troveSource = defineSource({
  name: 'trove',
  displayName: 'Trove (National Library of Australia)',
  description: 'Federal digitised collections including newspapers, books, images, maps, and government gazettes.',
  requiresAuth: true,
  authEnvVar: 'TROVE_API_KEY',
  checkAuth: () => !!process.env.TROVE_API_KEY,
  tools: [
    // Core search and harvest
    troveSearchTool,
    troveHarvestTool,
    // Newspaper tools
    troveNewspaperArticleTool,
    troveListTitlesTool,
    troveTitleDetailsTool,
    // Contributor tools
    troveGetContributorTool,
    troveListContributorsTool,
    // Magazine tools
    troveListMagazineTitlesTool,
    troveGetMagazineTitleTool,
    // Work/Person/List tools (new)
    troveGetWorkTool,
    troveGetVersionsTool,
    troveGetPersonTool,
    troveGetListTool,
    troveSearchPeopleTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { troveClient } from './client.js';
