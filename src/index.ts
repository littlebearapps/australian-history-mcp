#!/usr/bin/env node
/**
 * Australian Archives MCP Server
 *
 * Provides Claude Code with programmatic access to:
 * - PROV (Public Record Office Victoria) - Victorian state archives
 * - Trove (National Library of Australia) - Federal digitised collections
 * - data.gov.au (CKAN) - Australian government open data portal
 *
 * @package @littlebearapps/australian-archives-mcp
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool definitions and executors
import { provSearchSchema, executePROVSearch } from './tools/prov_search.js';
import { troveSearchSchema, executeTroveSearch } from './tools/trove_search.js';
import {
  troveNewspaperArticleSchema,
  executeTroveNewspaperArticle,
  troveListTitlesSchema,
  executeTroveListTitles,
  troveTitleDetailsSchema,
  executeTroveTitleDetails,
} from './tools/trove_newspaper.js';
import {
  provHarvestSchema,
  executePROVHarvest,
  troveHarvestSchema,
  executeTroveHarvest,
  dataGovAUHarvestSchema,
  executeDataGovAUHarvest,
} from './tools/harvest.js';
import {
  dataGovAUSearchSchema,
  executeDataGovAUSearch,
} from './tools/datagovau_search.js';
import {
  dataGovAUGetDatasetSchema,
  executeDataGovAUGetDataset,
  dataGovAUGetResourceSchema,
  executeDataGovAUGetResource,
  dataGovAUDatastoreSearchSchema,
  executeDataGovAUDatastoreSearch,
} from './tools/datagovau_dataset.js';
import {
  dataGovAUListOrganizationsSchema,
  executeDataGovAUListOrganizations,
  dataGovAUGetOrganizationSchema,
  executeDataGovAUGetOrganization,
  dataGovAUListGroupsSchema,
  executeDataGovAUListGroups,
  dataGovAUGetGroupSchema,
  executeDataGovAUGetGroup,
  dataGovAUListTagsSchema,
  executeDataGovAUListTags,
} from './tools/datagovau_browse.js';

// ============================================================================
// Server Setup
// ============================================================================

const server = new Server(
  {
    name: 'australian-archives-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// Tool Registration
// ============================================================================

const tools = [
  // PROV tools
  provSearchSchema,
  provHarvestSchema,
  // Trove tools
  troveSearchSchema,
  troveNewspaperArticleSchema,
  troveListTitlesSchema,
  troveTitleDetailsSchema,
  troveHarvestSchema,
  // data.gov.au tools
  dataGovAUSearchSchema,
  dataGovAUGetDatasetSchema,
  dataGovAUGetResourceSchema,
  dataGovAUDatastoreSearchSchema,
  dataGovAUListOrganizationsSchema,
  dataGovAUGetOrganizationSchema,
  dataGovAUListGroupsSchema,
  dataGovAUGetGroupSchema,
  dataGovAUListTagsSchema,
  dataGovAUHarvestSchema,
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// ============================================================================
// Tool Execution
// ============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // PROV tools
      case 'prov_search':
        return await executePROVSearch(args as any);

      case 'prov_harvest':
        return await executePROVHarvest(args as any);

      // Trove tools
      case 'trove_search':
        return await executeTroveSearch(args as any);

      case 'trove_newspaper_article':
        return await executeTroveNewspaperArticle(args as any);

      case 'trove_list_titles':
        return await executeTroveListTitles(args as any);

      case 'trove_title_details':
        return await executeTroveTitleDetails(args as any);

      case 'trove_harvest':
        return await executeTroveHarvest(args as any);

      // data.gov.au tools
      case 'datagovau_search':
        return await executeDataGovAUSearch(args as any);

      case 'datagovau_get_dataset':
        return await executeDataGovAUGetDataset(args as any);

      case 'datagovau_get_resource':
        return await executeDataGovAUGetResource(args as any);

      case 'datagovau_datastore_search':
        return await executeDataGovAUDatastoreSearch(args as any);

      case 'datagovau_list_organizations':
        return await executeDataGovAUListOrganizations(args as any);

      case 'datagovau_get_organization':
        return await executeDataGovAUGetOrganization(args as any);

      case 'datagovau_list_groups':
        return await executeDataGovAUListGroups(args as any);

      case 'datagovau_get_group':
        return await executeDataGovAUGetGroup(args as any);

      case 'datagovau_list_tags':
        return await executeDataGovAUListTags(args as any);

      case 'datagovau_harvest':
        return await executeDataGovAUHarvest(args as any);

      default:
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: `Unknown tool: ${name}` }),
          }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          tool: name,
        }),
      }],
      isError: true,
    };
  }
});

// ============================================================================
// Server Startup
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Australian Archives MCP Server running on stdio');
  console.error('Tools available:');
  console.error('  PROV: prov_search, prov_harvest');
  console.error('  Trove: trove_search, trove_newspaper_article, trove_list_titles, trove_title_details, trove_harvest');
  console.error('  data.gov.au: datagovau_search, datagovau_get_dataset, datagovau_get_resource, datagovau_datastore_search,');
  console.error('               datagovau_list_organizations, datagovau_get_organization, datagovau_list_groups,');
  console.error('               datagovau_get_group, datagovau_list_tags, datagovau_harvest');

  if (!process.env.TROVE_API_KEY) {
    console.error('');
    console.error('WARNING: TROVE_API_KEY not set. Trove tools will not work.');
    console.error('Apply for a key: https://trove.nla.gov.au/about/create-something/using-api');
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
