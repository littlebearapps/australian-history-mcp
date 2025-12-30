/**
 * Session List Meta-Tool
 *
 * Phase 2: Browse and filter all research sessions
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { sessionStore } from '../sessions/store.js';
import { isSessionStatus } from '../sessions/types.js';

export const sessionListMetaTool: SourceTool = {
  schema: {
    name: 'session_list',
    description: 'List all research sessions with optional filtering by status or topic.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'paused', 'completed', 'archived'],
          description: 'Filter by session status',
        },
        topic: {
          type: 'string',
          description: 'Search in topic text (case-insensitive)',
        },
        limit: {
          type: 'number',
          description: 'Maximum sessions to return (default: 10)',
        },
        includeArchived: {
          type: 'boolean',
          description: 'Include archived sessions (default: false)',
        },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const status = args.status as string | undefined;
    const topic = args.topic as string | undefined;
    const limit = (args.limit as number) ?? 10;
    const includeArchived = (args.includeArchived as boolean) ?? false;

    // Validate status if provided
    if (status && !isSessionStatus(status)) {
      return errorResponse(
        `Invalid status '${status}'. Use: active, paused, completed, or archived`
      );
    }

    try {
      const result = sessionStore.list({
        status: status as 'active' | 'paused' | 'completed' | 'archived' | undefined,
        topic,
        limit,
        includeArchived,
      });

      // Return summary for each session
      const sessions = result.sessions.map((s) => ({
        id: s.id,
        name: s.name,
        topic: s.topic,
        status: s.status,
        created: s.created,
        updated: s.updated,
        stats: {
          queries: s.stats.totalQueries,
          results: s.stats.uniqueResults,
        },
      }));

      return successResponse({
        sessions,
        total: result.total,
        hasMore: result.hasMore,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
