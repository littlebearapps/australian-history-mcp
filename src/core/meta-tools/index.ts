/**
 * Meta-Tools Barrel Export
 *
 * Exports all 6 meta-tools for the dynamic loading architecture.
 * These are the only tools exposed via ListToolsRequest.
 */

import type { SourceTool } from '../base-source.js';
import { toolsMetaTool } from './tools.js';
import { schemaMetaTool } from './schema.js';
import { runMetaTool } from './run.js';
import { searchMetaTool } from './search.js';
import { openMetaTool } from './open.js';
import { exportMetaTool } from './export.js';

/**
 * All meta-tools in order of typical usage:
 * 1. tools - discover available data tools
 * 2. schema - get parameters for a specific tool
 * 3. run - execute a data tool
 * 4. search - federated search across multiple sources
 * 5. open - open URL in browser
 * 6. export - export records to various formats
 */
export const metaTools: SourceTool[] = [
  toolsMetaTool,
  schemaMetaTool,
  runMetaTool,
  searchMetaTool,
  openMetaTool,
  exportMetaTool,
];

// Named exports for direct access
export { toolsMetaTool } from './tools.js';
export { schemaMetaTool } from './schema.js';
export { runMetaTool } from './run.js';
export { searchMetaTool } from './search.js';
export { openMetaTool } from './open.js';
export { exportMetaTool } from './export.js';
