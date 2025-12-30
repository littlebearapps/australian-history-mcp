/**
 * Session Resume Meta-Tool
 *
 * Phase 2: Reactivate a paused research session
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { sessionStore } from '../sessions/store.js';

export const sessionResumeMetaTool: SourceTool = {
  schema: {
    name: 'session_resume',
    description:
      'Resume a paused research session. Cannot resume completed or archived sessions. Only one session can be active at a time.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Session ID to resume (required)',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const id = args.id as string;

    if (!id || typeof id !== 'string') {
      return errorResponse('Session ID is required');
    }

    try {
      // BUG-006: Try as UUID first, then as session name
      let session = sessionStore.get(id);
      if (!session) {
        session = sessionStore.getByName(id);
      }
      if (!session) {
        return errorResponse(`Session not found: "${id}". Use session_list to see available sessions.`);
      }

      // Now resume the found session by its actual ID
      session = sessionStore.resume(session.id);

      const coverageSummary = sessionStore.getCoverageSummary(session.id);

      return successResponse({
        status: 'resumed',
        session: {
          id: session.id,
          name: session.name,
          topic: session.topic,
          currentStats: session.stats,
        },
        coverage: {
          searched: coverageSummary.searched,
          pending: coverageSummary.pending,
        },
        message: `Session '${session.name}' resumed. ${coverageSummary.pending.length} sources remaining.`,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
