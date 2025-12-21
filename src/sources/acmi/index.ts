/**
 * Australian Centre for the Moving Image (ACMI) Source Module
 *
 * Provides access to ACMI's collection of films, TV, videogames, and digital art.
 * No API key required.
 *
 * API Documentation: https://www.acmi.net.au/api
 */

import { defineSource } from '../../core/base-source.js';
import { acmiSearchWorksTool } from './tools/search-works.js';
import { acmiGetWorkTool } from './tools/get-work.js';
import { acmiHarvestTool } from './tools/harvest.js';

export const acmiSource = defineSource({
  name: 'acmi',
  displayName: 'Australian Centre for the Moving Image',
  description: 'ACMI moving image collection including films, TV, videogames, and digital art.',
  requiresAuth: false,
  tools: [
    acmiSearchWorksTool,
    acmiGetWorkTool,
    acmiHarvestTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { acmiClient } from './client.js';
