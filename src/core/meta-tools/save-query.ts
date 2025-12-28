/**
 * Save Query Meta-Tool
 *
 * SEARCH-019: Save a named query for later reuse
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { savedQueriesStore } from '../saved-queries/store.js';

export const saveQueryMetaTool: SourceTool = {
  schema: {
    name: 'save_query',
    description:
      'Save a search query for later reuse. Saved queries can be executed with run_query.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description:
            'Unique name for the query (letters, numbers, hyphens, underscores only, max 64 chars)',
        },
        description: {
          type: 'string',
          description: 'Optional description of what this query finds',
        },
        source: {
          type: 'string',
          description:
            'Source to query (e.g., "prov", "trove", "nma") or "federated" for cross-source search',
        },
        tool: {
          type: 'string',
          description:
            'Tool name to execute (e.g., "prov_search", "trove_search") or "search" for federated',
        },
        parameters: {
          type: 'object',
          description: 'Query parameters (e.g., {query: "gold rush", limit: 20})',
          additionalProperties: true,
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional tags for categorization',
        },
      },
      required: ['name', 'source', 'tool', 'parameters'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const name = args.name as string;
    const description = args.description as string | undefined;
    const source = args.source as string;
    const tool = args.tool as string;
    const parameters = args.parameters as Record<string, unknown>;
    const tags = args.tags as string[] | undefined;

    if (!name || typeof name !== 'string') {
      return errorResponse('Query name is required');
    }

    if (!source || typeof source !== 'string') {
      return errorResponse('Source is required');
    }

    if (!tool || typeof tool !== 'string') {
      return errorResponse('Tool name is required');
    }

    if (!parameters || typeof parameters !== 'object') {
      return errorResponse('Parameters object is required');
    }

    try {
      const savedQuery = savedQueriesStore.saveQuery({
        name,
        description,
        source,
        tool,
        parameters,
        tags,
      });

      return successResponse({
        action: 'saved',
        query: savedQuery,
        message: `Query "${name}" saved successfully`,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
