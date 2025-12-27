#!/usr/bin/env node
/**
 * Australian History MCP Server
 *
 * Dynamic Tool Loading Architecture:
 * Exposes 5 meta-tools for discovery, schema lookup, and execution.
 * All 69 data tools are available via run(tool, args).
 *
 * Meta-tools:
 * - tools: Discover available data tools by keyword, source, or category
 * - schema: Get full input schema for a specific tool
 * - run: Execute any data tool by name with arguments
 * - open: Open a URL in the default browser
 * - export: Export records to CSV, JSON, Markdown, or download script
 *
 * Data sources (69 tools across 11 sources):
 * - PROV (Public Record Office Victoria) - Victorian state archives
 * - Trove (National Library of Australia) - Federal digitised collections
 * - Museums Victoria - Victorian museum collections
 * - ALA (Atlas of Living Australia) - Australian biodiversity data
 * - NMA (National Museum of Australia) - National museum collections
 * - VHD (Victorian Heritage Database) - Heritage places and shipwrecks
 * - ACMI (Australian Centre for the Moving Image) - Films, TV, videogames
 * - PM Transcripts - Prime Ministerial speeches and media releases
 * - IIIF - Generic IIIF manifest and image tools (any institution)
 * - GA HAP (Geoscience Australia) - Historical aerial photography (1928-1996)
 * - GHAP (Gazetteer of Historical Australian Placenames) - Historical placenames
 *
 * @package @littlebearapps/australian-history-mcp
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import registry and source modules (for run dispatch)
import { registry } from './registry.js';
import { provSource } from './sources/prov/index.js';
import { troveSource } from './sources/trove/index.js';
import { museumsVictoriaSource } from './sources/museums-victoria/index.js';
import { alaSource } from './sources/ala/index.js';
import { nmaSource } from './sources/nma/index.js';
import { vhdSource } from './sources/vhd/index.js';
import { acmiSource } from './sources/acmi/index.js';
import { pmTranscriptsSource } from './sources/pm-transcripts/index.js';
import { iiifSource } from './sources/iiif/index.js';
import { gaHapSource } from './sources/ga-hap/index.js';
import { ghapSource } from './sources/ghap/index.js';

// Import meta-tools (only these are exposed in dynamic mode)
import { metaTools } from './core/meta-tools/index.js';
import { errorResponse } from './core/types.js';

// ============================================================================
// Mode Configuration
// ============================================================================

/**
 * MCP_MODE environment variable controls tool exposure:
 * - "dynamic" (default): 5 meta-tools, 69 data tools via run()
 * - "legacy": All 69 data tools exposed directly (backwards compatible)
 */
const MCP_MODE = process.env.MCP_MODE?.toLowerCase() === 'legacy' ? 'legacy' : 'dynamic';

// ============================================================================
// Register Source Modules
// ============================================================================

registry.register(provSource);
registry.register(troveSource);
registry.register(museumsVictoriaSource);
registry.register(alaSource);
registry.register(nmaSource);
registry.register(vhdSource);
registry.register(acmiSource);
registry.register(pmTranscriptsSource);
registry.register(iiifSource);
registry.register(gaHapSource);
registry.register(ghapSource);

// ============================================================================
// Server Setup
// ============================================================================

const server = new Server(
  {
    name: 'australian-history-mcp',
    version: '0.6.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// Tool Registration (mode-dependent)
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  if (MCP_MODE === 'legacy') {
    // Legacy mode: expose all 69 data tools directly
    return { tools: registry.listTools() };
  }
  // Dynamic mode: expose only 5 meta-tools
  return { tools: metaTools.map((t) => t.schema) };
});

// ============================================================================
// Tool Execution (mode-dependent)
// ============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (MCP_MODE === 'legacy') {
    // Legacy mode: execute data tools directly
    if (registry.hasTool(name)) {
      return registry.executeTool(name, args ?? {});
    }
    return errorResponse(`Unknown tool: ${name}`, 'server');
  }

  // Dynamic mode: check meta-tools first
  const metaTool = metaTools.find((t) => t.schema.name === name);
  if (metaTool) {
    return metaTool.execute(args ?? {});
  }

  // Fallback for direct tool calls (backwards compatibility in dynamic mode)
  if (registry.hasTool(name)) {
    return registry.executeTool(name, args ?? {});
  }

  // Unknown tool
  return errorResponse(`Unknown tool: ${name}. Use tools() to discover available tools.`, 'server');
});

// ============================================================================
// Server Startup
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Australian History MCP Server running on stdio');
  console.error('');

  if (MCP_MODE === 'legacy') {
    console.error('Mode: LEGACY (all 69 tools exposed directly)');
    console.error(`  Tools: ${registry.toolCount} data tools`);
    console.error('  Tip: Set MCP_MODE=dynamic for 93% token reduction');
  } else {
    console.error('Mode: DYNAMIC (5 meta-tools, lazy loading)');
    console.error(`  Exposed: ${metaTools.length} meta-tools (tools, schema, run, open, export)`);
    console.error(`  Available: ${registry.toolCount} data tools via run(tool, args)`);
    console.error('  Tip: Set MCP_MODE=legacy for backwards compatibility');
  }

  // Show source status
  const sources = registry.getSourcesStatus();
  console.error('');
  console.error('Data sources:');
  for (const source of sources) {
    const authStatus = source.authRequired
      ? (source.authConfigured ? '✓' : '✗ (key required)')
      : '';
    console.error(`  ${source.name}: ${source.toolCount} tools ${authStatus}`);
  }

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
