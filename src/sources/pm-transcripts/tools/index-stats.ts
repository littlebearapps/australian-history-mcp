/**
 * PM Transcripts Index Stats Tool
 *
 * SEARCH-018: Tool to get statistics about the FTS5 search index
 *
 * Returns information about the indexed content including
 * transcript counts, date ranges, and database size.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { PMTranscriptsStore, pmTranscriptsStore } from '../index/sqlite-store.js';

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const pmTranscriptsIndexStatsTool: SourceTool = {
  schema: {
    name: 'pm_transcripts_index_stats',
    description:
      'Get statistics about the PM Transcripts FTS5 search index. ' +
      'Shows transcript count, date range, Prime Ministers, and database size.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        includeListings: {
          type: 'boolean',
          description: 'Include lists of Prime Ministers and release types (default: true)',
          default: true,
        },
      },
    },
  },

  async execute(args: Record<string, unknown>) {
    const includeListings = args.includeListings !== false;

    // Check if index exists
    if (!PMTranscriptsStore.exists()) {
      return successResponse({
        source: 'pm-transcripts',
        indexExists: false,
        message:
          'Index not found. Run pm_transcripts_build_index to create the search index.',
        dbPath: PMTranscriptsStore.getDbPath(),
      });
    }

    const store = pmTranscriptsStore;

    try {
      store.open();

      const stats = store.getStats();

      const response: Record<string, unknown> = {
        source: 'pm-transcripts',
        indexExists: true,
        indexVersion: stats.indexVersion,
        totalTranscripts: stats.totalTranscripts,
        uniquePrimeMinisters: stats.uniquePrimeMinisters,
        uniqueReleaseTypes: stats.uniqueReleaseTypes,
        dateRange: {
          earliest: stats.dateRange.earliest,
          latest: stats.dateRange.latest,
        },
        databaseSize: formatBytes(stats.dbSizeBytes),
        databaseSizeBytes: stats.dbSizeBytes,
        lastUpdated: stats.lastUpdated,
        dbPath: PMTranscriptsStore.getDbPath(),
      };

      if (includeListings) {
        response.primeMinisters = store.listPrimeMinisters();
        response.releaseTypes = store.listReleaseTypes();
      }

      return successResponse(response);
    } catch (error) {
      return errorResponse(error);
    } finally {
      store.close();
    }
  },
};
