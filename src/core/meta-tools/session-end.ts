/**
 * Session End Meta-Tool
 *
 * Phase 2: Complete or archive a research session
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { sessionStore } from '../sessions/store.js';

export const sessionEndMetaTool: SourceTool = {
  schema: {
    name: 'session_end',
    description:
      'End the active research session. Marks session as completed or archived. Ended sessions cannot be resumed.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Session ID to end (defaults to active session)',
        },
        status: {
          type: 'string',
          enum: ['completed', 'archived'],
          description:
            'Final status: "completed" (finished research) or "archived" (abandoned/reference only). Default: "completed"',
        },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const id = args.id as string | undefined;
    const status = (args.status as 'completed' | 'archived') ?? 'completed';

    try {
      // Get session to end
      let session;
      if (id) {
        session = sessionStore.get(id);
        if (!session) {
          return errorResponse(`Session '${id}' not found`);
        }
      } else {
        session = sessionStore.getActive();
        if (!session) {
          return errorResponse('No active session to end');
        }
      }

      // End the session
      const endedSession = sessionStore.end(session.id, status);

      return successResponse({
        status: 'ended',
        session: {
          id: endedSession.id,
          name: endedSession.name,
          finalStats: endedSession.stats,
        },
        message: `Session '${endedSession.name}' marked as ${status}. Final stats: ${endedSession.stats.totalQueries} queries, ${endedSession.stats.uniqueResults} unique results.`,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
