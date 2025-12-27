/**
 * Schema Meta-Tool
 *
 * Returns the full input schema for a specific tool.
 * Used for lazy loading of tool parameters.
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { registry } from '../../registry.js';
import { getToolEntry } from '../tool-index.js';

export const schemaMetaTool: SourceTool = {
  schema: {
    name: 'schema',
    description: 'Get the full input schema for a specific tool.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tool: { type: 'string', description: 'Tool name (e.g., prov_search, trove_harvest)' },
      },
      required: ['tool'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { tool: string };

    if (!input.tool) {
      return errorResponse('Tool name is required', 'schema');
    }

    try {
      // Get tool entry from index for metadata
      const entry = getToolEntry(input.tool);
      if (!entry) {
        return errorResponse(
          `Unknown tool: ${input.tool}. Use tools() to discover available tools.`,
          'schema'
        );
      }

      // Get full schema from registry
      const toolSchema = registry.getToolSchema(input.tool);
      if (!toolSchema) {
        return errorResponse(
          `Tool schema not found: ${input.tool}. This is a server error.`,
          'schema'
        );
      }

      return successResponse({
        tool: input.tool,
        source: entry.sourceDisplay,
        category: entry.category,
        description: toolSchema.description,
        authRequired: entry.authRequired,
        inputSchema: toolSchema.inputSchema,
        _cache: {
          hint: 'Schema is stable - cache for session to avoid repeated lookups',
          key: `schema:${input.tool}`,
          ttl: 'session',
        },
        usage: `run(tool="${input.tool}", args={...})`,
      });
    } catch (error) {
      return errorResponse(error, 'schema');
    }
  },
};
