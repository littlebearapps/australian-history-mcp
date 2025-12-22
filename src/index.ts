#!/usr/bin/env node
/**
 * Australian Archives MCP Server
 *
 * Provides Claude Code with programmatic access to:
 * - PROV (Public Record Office Victoria) - Victorian state archives
 * - Trove (National Library of Australia) - Federal digitised collections
 * - data.gov.au (CKAN) - Australian government open data portal
 * - Museums Victoria - Victorian museum collections
 * - ALA (Atlas of Living Australia) - Australian biodiversity data
 * - NMA (National Museum of Australia) - National museum collections
 * - VHD (Victorian Heritage Database) - Heritage places and shipwrecks
 * - ACMI (Australian Centre for the Moving Image) - Films, TV, videogames
 * - PM Transcripts - Prime Ministerial speeches and media releases
 * - IIIF - Generic IIIF manifest and image tools (any institution)
 * - GA HAP (Geoscience Australia) - Historical aerial photography (1928-1996)
 *
 * @package @littlebearapps/australian-archives-mcp
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import registry and source modules
import { registry } from './registry.js';
import { provSource } from './sources/prov/index.js';
import { troveSource } from './sources/trove/index.js';
import { dataGovAUSource } from './sources/datagovau/index.js';
import { museumsVictoriaSource } from './sources/museums-victoria/index.js';
import { alaSource } from './sources/ala/index.js';
import { nmaSource } from './sources/nma/index.js';
import { vhdSource } from './sources/vhd/index.js';
import { acmiSource } from './sources/acmi/index.js';
import { pmTranscriptsSource } from './sources/pm-transcripts/index.js';
import { iiifSource } from './sources/iiif/index.js';
import { gaHapSource } from './sources/ga-hap/index.js';

// ============================================================================
// Register Source Modules
// ============================================================================

registry.register(provSource);
registry.register(troveSource);
registry.register(dataGovAUSource);
registry.register(museumsVictoriaSource);
registry.register(alaSource);
registry.register(nmaSource);
registry.register(vhdSource);
registry.register(acmiSource);
registry.register(pmTranscriptsSource);
registry.register(iiifSource);
registry.register(gaHapSource);

// ============================================================================
// Server Setup
// ============================================================================

const server = new Server(
  {
    name: 'australian-archives-mcp',
    version: '0.5.0',
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

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: registry.listTools(),
}));

// ============================================================================
// Tool Execution
// ============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return registry.executeTool(name, args ?? {});
});

// ============================================================================
// Server Startup
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Australian Archives MCP Server running on stdio');

  // Show source status
  const sources = registry.getSourcesStatus();
  console.error('');
  console.error('Registered sources:');
  for (const source of sources) {
    const authStatus = source.authRequired
      ? (source.authConfigured ? '✓' : '✗ (API key required)')
      : '(no auth)';
    console.error(`  ${source.name}: ${source.toolCount} tools ${authStatus}`);
  }

  console.error('');
  console.error(`Total: ${registry.toolCount} tools from ${registry.sourceCount} sources`);

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
