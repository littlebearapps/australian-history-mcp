/**
 * Run Meta-Tool
 *
 * Executes any data tool by name with provided arguments.
 * Dispatches to the underlying tool implementation via registry.
 */

import type { SourceTool } from '../base-source.js';
import { errorResponse } from '../types.js';
import { registry } from '../../registry.js';
import { getToolEntry } from '../tool-index.js';

export const runMetaTool: SourceTool = {
  schema: {
    name: 'run',
    description: 'Execute any data tool by name with provided arguments.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tool: { type: 'string', description: 'Tool name to execute (e.g., prov_search)' },
        args: {
          type: 'object',
          description: 'Arguments for the tool (use schema(tool) to see available parameters)',
          additionalProperties: true,
        },
      },
      required: ['tool'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      tool: string;
      args?: Record<string, unknown>;
    };

    if (!input.tool) {
      return errorResponse('Tool name is required', 'run');
    }

    // Validate tool exists
    const entry = getToolEntry(input.tool);
    if (!entry) {
      return errorResponse(
        `Unknown tool: ${input.tool}. Use tools() to discover available tools.`,
        'run'
      );
    }

    // Check if tool requires auth
    if (entry.authRequired && entry.source === 'trove') {
      if (!process.env.TROVE_API_KEY) {
        return errorResponse(
          `Tool ${input.tool} requires TROVE_API_KEY to be set.`,
          'run'
        );
      }
    }

    // Validate required parameters from tool schema
    const schema = registry.getToolSchema(input.tool);
    if (schema?.inputSchema) {
      const inputSchema = schema.inputSchema as { required?: string[] };
      const requiredParams = inputSchema.required ?? [];
      const providedArgs = input.args ?? {};
      const missingParams = requiredParams.filter(
        (param) => providedArgs[param] === undefined || providedArgs[param] === ''
      );

      if (missingParams.length > 0) {
        return errorResponse(
          `Missing required parameter(s): ${missingParams.join(', ')}. Use schema("${input.tool}") to see all parameters.`,
          'run'
        );
      }
    }

    // Dispatch to underlying tool
    // The registry.executeTool already handles errors gracefully
    return registry.executeTool(input.tool, input.args ?? {});
  },
};
