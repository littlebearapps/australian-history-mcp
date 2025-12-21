/**
 * Atlas of Living Australia (ALA) Source Module
 *
 * Provides access to species occurrence records and taxonomic information
 * from Australia's national biodiversity database.
 *
 * No API key required.
 */

import { defineSource } from '../../core/base-source.js';
import { alaSearchOccurrencesTool } from './tools/search-occurrences.js';
import { alaSearchSpeciesTool } from './tools/search-species.js';
import { alaGetSpeciesTool } from './tools/get-species.js';
import { alaHarvestTool } from './tools/harvest.js';

export const alaSource = defineSource({
  name: 'ala',
  displayName: 'Atlas of Living Australia',
  description: 'Australian biodiversity data including species occurrences and taxonomy.',
  requiresAuth: false,
  tools: [
    alaSearchOccurrencesTool,
    alaSearchSpeciesTool,
    alaGetSpeciesTool,
    alaHarvestTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { alaClient } from './client.js';
