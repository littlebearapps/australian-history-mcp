/**
 * Session Start Meta-Tool
 *
 * Phase 2: Begin a named research session
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { sessionStore } from '../sessions/store.js';

export const sessionStartMetaTool: SourceTool = {
  schema: {
    name: 'session_start',
    description:
      'Start a new research session. Sessions track queries, deduplicate results, and monitor source coverage. Only one session can be active at a time.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description:
            'Unique session name (letters, numbers, hyphens, underscores only, max 64 chars). Example: "arden-street-1920s"',
        },
        topic: {
          type: 'string',
          description:
            'Research topic description. Example: "History of Arden Street Oval in the 1920s"',
        },
        planId: {
          type: 'string',
          description:
            'Optional: Link to plan_search session ID (connects session to research plan)',
        },
        planPath: {
          type: 'string',
          description: 'Optional: Path to plan.md file (for reference)',
        },
      },
      required: ['name', 'topic'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const name = args.name as string;
    const topic = args.topic as string;
    const planId = args.planId as string | undefined;
    const planPath = args.planPath as string | undefined;

    if (!name || typeof name !== 'string') {
      return errorResponse('Session name is required');
    }

    if (!topic || typeof topic !== 'string') {
      return errorResponse('Topic is required');
    }

    try {
      const session = sessionStore.create({
        name,
        topic,
        planId,
        planPath,
      });

      return successResponse({
        status: 'created',
        session: {
          id: session.id,
          name: session.name,
          topic: session.topic,
          created: session.created,
        },
        message: `Session '${name}' started. All searches will be logged and deduplicated automatically.`,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
