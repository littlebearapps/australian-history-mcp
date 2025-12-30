/**
 * Run Query Meta-Tool
 *
 * SEARCH-019: Execute a saved query with optional parameter overrides
 */

import type { SourceTool } from '../base-source.js';
import { errorResponse } from '../types.js';
import { savedQueriesStore, SavedQueriesStore } from '../saved-queries/store.js';
import { registry } from '../../registry.js';

// BUG-008: Lazy load metaTools to avoid circular dependency
let _metaTools: SourceTool[] | null = null;
async function getMetaTools(): Promise<SourceTool[]> {
  if (!_metaTools) {
    const mod = await import('./index.js');
    _metaTools = mod.metaTools;
  }
  return _metaTools;
}

export const runQueryMetaTool: SourceTool = {
  schema: {
    name: 'run_query',
    description:
      'Execute a saved query by name. Optionally override specific parameters.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Name of the saved query to run',
        },
        overrides: {
          type: 'object',
          description:
            'Optional parameter overrides (e.g., {limit: 10, dateFrom: "1920"})',
          additionalProperties: true,
        },
      },
      required: ['name'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const name = args.name as string;
    const overrides = (args.overrides as Record<string, unknown>) ?? {};

    if (!name || typeof name !== 'string') {
      return errorResponse('Query name is required');
    }

    // Check if queries file exists
    if (!SavedQueriesStore.exists()) {
      return errorResponse(
        'No saved queries found. Use save_query to save a query first.'
      );
    }

    // Get the saved query
    const query = savedQueriesStore.getQuery(name);
    if (!query) {
      return errorResponse(`Query not found: "${name}". Use list_queries to see available queries.`);
    }

    // Merge parameters with overrides
    const mergedParams = { ...query.parameters, ...overrides };

    try {
      // Mark the query as used
      savedQueriesStore.markUsed(name);

      // BUG-008: Check meta-tools first, then registry
      const metaTools = await getMetaTools();
      const metaTool = metaTools.find((t) => t.schema.name === query.tool);
      if (metaTool) {
        // Execute meta-tool directly
        const result = await metaTool.execute(mergedParams);

        // Add query metadata to the result
        const content = result.content[0];
        if (content.type === 'text') {
          try {
            const parsed = JSON.parse(content.text);
            parsed._savedQuery = {
              name: query.name,
              useCount: query.useCount + 1,
              overridesApplied: Object.keys(overrides).length > 0,
            };
            return {
              content: [{ type: 'text' as const, text: JSON.stringify(parsed, null, 2) }],
            };
          } catch {
            return result;
          }
        }
        return result;
      }

      // Check if tool exists in registry (data tools)
      const toolSchema = registry.getToolSchema(query.tool);
      if (!toolSchema) {
        return errorResponse(
          `Tool not found: "${query.tool}". The tool may have been removed or renamed.`
        );
      }

      // Execute data tool via registry
      const result = await registry.executeTool(query.tool, mergedParams);

      // Add query metadata to the result
      const content = result.content[0];
      if (content.type === 'text') {
        try {
          const parsed = JSON.parse(content.text);
          parsed._savedQuery = {
            name: query.name,
            useCount: query.useCount + 1,
            overridesApplied: Object.keys(overrides).length > 0,
          };
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(parsed, null, 2) }],
          };
        } catch {
          // If parsing fails, return original result
          return result;
        }
      }

      return result;
    } catch (error) {
      return errorResponse(error);
    }
  },
};
