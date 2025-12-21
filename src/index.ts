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

// Import registry and source modules
import { registry } from './registry.js';
import { provSource } from './sources/prov/index.js';
import { troveSource } from './sources/trove/index.js';
import { dataGovAUSource } from './sources/datagovau/index.js';
import { museumsVictoriaSource } from './sources/museums-victoria/index.js';

// ============================================================================
// Register Source Modules
// ============================================================================

registry.register(provSource);
registry.register(troveSource);
registry.register(dataGovAUSource);
registry.register(museumsVictoriaSource);

// ============================================================================
// Server Setup
// ============================================================================

const server = new Server(
  {
    name: 'australian-archives-mcp',
    version: '0.2.0',
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
