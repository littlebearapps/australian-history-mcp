/**
 * data.gov.au (CKAN) Source Module
 *
 * Provides access to Australia's national open data portal.
 * Aggregates 85,000+ datasets from 800+ government organisations.
 *
 * No API key required.
 */

import { defineSource } from '../../core/base-source.js';
import { dataGovAUSearchTool } from './tools/search.js';
import {
  dataGovAUGetDatasetTool,
  dataGovAUGetResourceTool,
  dataGovAUDatastoreSearchTool,
} from './tools/dataset.js';
import {
  dataGovAUListOrganizationsTool,
  dataGovAUGetOrganizationTool,
  dataGovAUListGroupsTool,
  dataGovAUGetGroupTool,
  dataGovAUListTagsTool,
} from './tools/browse.js';
import { dataGovAUHarvestTool } from './tools/harvest.js';

export const dataGovAUSource = defineSource({
  name: 'datagovau',
  displayName: 'data.gov.au',
  description: 'Australian government open data portal with 85,000+ datasets from 800+ organisations.',
  requiresAuth: false,
  tools: [
    dataGovAUSearchTool,
    dataGovAUGetDatasetTool,
    dataGovAUGetResourceTool,
    dataGovAUDatastoreSearchTool,
    dataGovAUListOrganizationsTool,
    dataGovAUGetOrganizationTool,
    dataGovAUListGroupsTool,
    dataGovAUGetGroupTool,
    dataGovAUListTagsTool,
    dataGovAUHarvestTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { dataGovAUClient } from './client.js';
