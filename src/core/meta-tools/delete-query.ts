/**
 * Delete Query Meta-Tool
 *
 * SEARCH-019: Remove a saved query by name
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { savedQueriesStore, SavedQueriesStore } from '../saved-queries/store.js';

export const deleteQueryMetaTool: SourceTool = {
  schema: {
    name: 'delete_query',
    description: 'Delete a saved query by name.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Name of the saved query to delete',
        },
      },
      required: ['name'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const name = args.name as string;

    if (!name || typeof name !== 'string') {
      return errorResponse('Query name is required');
    }

    // Check if queries file exists
    if (!SavedQueriesStore.exists()) {
      return errorResponse(
        'No saved queries found. Nothing to delete.'
      );
    }

    // Get the query first for the response
    const query = savedQueriesStore.getQuery(name);
    if (!query) {
      return errorResponse(`Query not found: "${name}". Use list_queries to see available queries.`);
    }

    try {
      const deleted = savedQueriesStore.deleteQuery(name);

      if (deleted) {
        return successResponse({
          action: 'deleted',
          name,
          message: `Query "${name}" deleted successfully`,
          remainingQueries: savedQueriesStore.count(),
        });
      } else {
        return errorResponse(`Failed to delete query "${name}"`);
      }
    } catch (error) {
      return errorResponse(error);
    }
  },
};
