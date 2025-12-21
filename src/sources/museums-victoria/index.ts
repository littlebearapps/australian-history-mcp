/**
 * Museums Victoria Source Module
 *
 * Provides access to Museums Victoria's collection of objects, specimens,
 * species information, and educational articles.
 *
 * No API key required.
 */

import { defineSource } from '../../core/base-source.js';
import { museumsvicSearchTool } from './tools/search.js';
import {
  museumsvicGetArticleTool,
  museumsvicGetItemTool,
  museumsvicGetSpeciesTool,
  museumsvicGetSpecimenTool,
} from './tools/records.js';
import { museumsvicHarvestTool } from './tools/harvest.js';

export const museumsVictoriaSource = defineSource({
  name: 'museumsvic',
  displayName: 'Museums Victoria',
  description: 'Victorian museum collections including objects, specimens, species, and articles.',
  requiresAuth: false,
  tools: [
    museumsvicSearchTool,
    museumsvicGetArticleTool,
    museumsvicGetItemTool,
    museumsvicGetSpeciesTool,
    museumsvicGetSpecimenTool,
    museumsvicHarvestTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { museumsVictoriaClient } from './client.js';
