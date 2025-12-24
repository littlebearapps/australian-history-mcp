/**
 * Base Source Interface
 *
 * Defines the contract that all data sources must implement
 * to integrate with the Australian History MCP server.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { MCPToolResponse } from './types.js';

/**
 * A single tool provided by a source
 */
export interface SourceTool {
  /** MCP tool schema (name, description, inputSchema) */
  schema: Tool;
  /** Function to execute the tool with validated arguments */
  execute: (args: Record<string, unknown>) => Promise<MCPToolResponse>;
}

/**
 * A data source that provides tools to the MCP server
 */
export interface Source {
  /** Short identifier (e.g., 'prov', 'trove', 'museumsvic') */
  name: string;

  /** Human-readable name (e.g., 'Public Record Office Victoria') */
  displayName: string;

  /** All tools provided by this source */
  tools: SourceTool[];

  /** Whether this source requires authentication */
  requiresAuth?: boolean;

  /** Environment variable name for auth (e.g., 'TROVE_API_KEY') */
  authEnvVar?: string;

  /** Function to check if auth is properly configured */
  checkAuth?: () => boolean;

  /** Optional description of what this source provides */
  description?: string;
}

/**
 * Helper to create a SourceTool from schema and executor
 */
export function createTool(
  schema: Tool,
  execute: (args: Record<string, unknown>) => Promise<MCPToolResponse>
): SourceTool {
  return { schema, execute };
}

/**
 * Helper to create a Source definition
 */
export function defineSource(config: Source): Source {
  return config;
}
