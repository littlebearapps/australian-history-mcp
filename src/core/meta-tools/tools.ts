/**
 * Tools Meta-Tool
 *
 * Discovers and lists available data tools by keyword, source, or category.
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { findTools, getSourceNames, TOOL_INDEX, type ToolCategory } from '../tool-index.js';

const CATEGORIES: ToolCategory[] = ['search', 'get', 'list', 'harvest'];

export const toolsMetaTool: SourceTool = {
  schema: {
    name: 'tools',
    description: 'List/discover available data tools by keyword, source, or category.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Keyword to search tool names/descriptions' },
        source: {
          type: 'string',
          description: 'Filter by source',
          enum: getSourceNames(),
        },
        category: {
          type: 'string',
          description: 'Filter by category',
          enum: CATEGORIES,
        },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      source?: string;
      category?: ToolCategory;
    };

    try {
      const results = findTools(input.query, input.source, input.category);

      // Format for display
      const tools = results.map((t) => ({
        name: t.name,
        source: t.sourceDisplay,
        category: t.category,
        description: t.description,
        authRequired: t.authRequired,
      }));

      // Build filter description
      const filters: string[] = [];
      if (input.query) filters.push(`query="${input.query}"`);
      if (input.source) filters.push(`source="${input.source}"`);
      if (input.category) filters.push(`category="${input.category}"`);

      return successResponse({
        matchingTools: tools.length,
        totalTools: TOOL_INDEX.length,
        filters: filters.length > 0 ? filters.join(', ') : 'none',
        tools,
        _cache: {
          hint: 'Tool index is stable - cache results for session',
          ttl: 'session',
        },
        workflow: tools.length > 0
          ? 'schema(tool) → get parameters → run(tool, args) → execute'
          : 'Try a different query or remove filters',
      });
    } catch (error) {
      return errorResponse(error, 'tools');
    }
  },
};
