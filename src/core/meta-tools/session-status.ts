/**
 * Session Status Meta-Tool
 *
 * Phase 2: Check current session progress and coverage gaps
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { sessionStore } from '../sessions/store.js';

/**
 * Format relative time (e.g., "2 minutes ago")
 */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

export const sessionStatusMetaTool: SourceTool = {
  schema: {
    name: 'session_status',
    description:
      'Get the status of a research session including progress, coverage gaps, and statistics.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Session ID to check (defaults to active session)',
        },
        detail: {
          type: 'string',
          enum: ['quick', 'full'],
          description:
            '"quick" returns summary only (token-efficient, default). "full" returns complete session data.',
        },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const id = args.id as string | undefined;
    const detail = (args.detail as 'quick' | 'full') ?? 'quick';

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
          return errorResponse('No active session. Use session_list to browse sessions.');
        }
      }

      const coverageSummary = sessionStore.getCoverageSummary(session.id);

      if (detail === 'full') {
        // Full mode: return complete session object
        return successResponse({
          session,
          coverageSummary,
        });
      }

      // Quick mode: token-efficient summary
      const totalSources = session.coverage.length;
      const searchedCount = coverageSummary.searched.length;

      return successResponse({
        session: {
          id: session.id,
          name: session.name,
          topic: session.topic,
          status: session.status,
        },
        progress: `${session.stats.totalQueries} queries, ${searchedCount}/${totalSources} sources`,
        results: {
          unique: session.stats.uniqueResults,
          duplicates: session.stats.duplicatesRemoved,
        },
        coverage: {
          searched: coverageSummary.searched,
          pending: coverageSummary.pending,
          failed: coverageSummary.failed,
        },
        lastActivity: formatRelativeTime(session.updated),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
