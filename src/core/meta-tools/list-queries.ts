/**
 * List Queries Meta-Tool
 *
 * SEARCH-019: List saved queries with filtering and sorting
 */

import type { SourceTool } from '../base-source.js';
import { successResponse } from '../types.js';
import { savedQueriesStore, SavedQueriesStore } from '../saved-queries/store.js';

export const listQueriesMetaTool: SourceTool = {
  schema: {
    name: 'list_queries',
    description:
      'List saved queries with optional filtering by source, tool, tag, or search term.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        source: {
          type: 'string',
          description: 'Filter by source name (e.g., "prov", "trove")',
        },
        tool: {
          type: 'string',
          description: 'Filter by tool name (e.g., "prov_search")',
        },
        tag: {
          type: 'string',
          description: 'Filter by tag',
        },
        search: {
          type: 'string',
          description: 'Search in query names and descriptions',
        },
        sortBy: {
          type: 'string',
          description: 'Sort field: name, createdAt, lastUsed, useCount (default: name)',
          enum: ['name', 'createdAt', 'lastUsed', 'useCount'],
          default: 'name',
        },
        sortOrder: {
          type: 'string',
          description: 'Sort order: asc or desc (default: asc)',
          enum: ['asc', 'desc'],
          default: 'asc',
        },
        limit: {
          type: 'number',
          description: 'Maximum results (default: 50)',
          default: 50,
        },
        offset: {
          type: 'number',
          description: 'Offset for pagination (default: 0)',
          default: 0,
        },
      },
    },
  },

  async execute(args: Record<string, unknown>) {
    // Check if queries file exists
    if (!SavedQueriesStore.exists()) {
      return successResponse({
        totalQueries: 0,
        returned: 0,
        queries: [],
        message: 'No saved queries found. Use save_query to save your first query.',
      });
    }

    const queries = savedQueriesStore.listQueries({
      source: args.source as string | undefined,
      tool: args.tool as string | undefined,
      tag: args.tag as string | undefined,
      search: args.search as string | undefined,
      sortBy: args.sortBy as 'name' | 'createdAt' | 'lastUsed' | 'useCount' | undefined,
      sortOrder: args.sortOrder as 'asc' | 'desc' | undefined,
      limit: args.limit as number | undefined,
      offset: args.offset as number | undefined,
    });

    const total = savedQueriesStore.count();
    const sources = savedQueriesStore.getSources();
    const tags = savedQueriesStore.getTags();

    return successResponse({
      totalQueries: total,
      returned: queries.length,
      offset: (args.offset as number) ?? 0,
      availableSources: sources,
      availableTags: tags,
      queries: queries.map((q) => ({
        name: q.name,
        description: q.description,
        source: q.source,
        tool: q.tool,
        parameters: q.parameters,
        createdAt: q.createdAt,
        lastUsed: q.lastUsed,
        useCount: q.useCount,
        tags: q.tags,
      })),
    });
  },
};
