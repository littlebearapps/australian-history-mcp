/**
 * Session Note Meta-Tool
 *
 * Phase 2: Add notes to a research session
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { sessionStore } from '../sessions/store.js';

export const sessionNoteMetaTool: SourceTool = {
  schema: {
    name: 'session_note',
    description: 'Add a note to a research session. Notes are preserved and exported with session data.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Session ID to add note to (defaults to active session)',
        },
        note: {
          type: 'string',
          description: 'Note text to add',
        },
      },
      required: ['note'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const id = args.id as string | undefined;
    const note = args.note as string;

    if (!note || typeof note !== 'string') {
      return errorResponse('Note text is required');
    }

    if (note.trim().length === 0) {
      return errorResponse('Note cannot be empty');
    }

    try {
      // Get session
      let session;
      if (id) {
        session = sessionStore.get(id);
        if (!session) {
          return errorResponse(`Session '${id}' not found`);
        }
      } else {
        session = sessionStore.getActive();
        if (!session) {
          return errorResponse('No active session. Provide session ID or start a session.');
        }
      }

      // Add the note
      const noteCount = sessionStore.addNote(session.id, note.trim());

      return successResponse({
        status: 'added',
        noteCount,
        message: `Note added to session '${session.name}'. Total notes: ${noteCount}`,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
