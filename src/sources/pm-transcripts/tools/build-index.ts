/**
 * PM Transcripts Build Index Tool
 *
 * SEARCH-018: Tool to build/rebuild/update the FTS5 search index
 *
 * This tool fetches transcripts from the PM Transcripts API
 * and indexes them locally for fast full-text search.
 *
 * Note: Initial full build takes ~43 minutes (26k transcripts x 100ms delay)
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { buildIndex, getPmIdRange, getKnownPrimeMinisters } from '../index/indexer.js';
import { PMTranscriptsStore } from '../index/sqlite-store.js';
import type { BuildMode } from '../index/types.js';

export const pmTranscriptsBuildIndexTool: SourceTool = {
  schema: {
    name: 'pm_transcripts_build_index',
    description:
      'Build or update the PM Transcripts FTS5 search index. ' +
      'First-time build: ~43 minutes for all ~26,000 transcripts. ' +
      'Update mode: Only fetches new transcripts since last build.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        mode: {
          type: 'string',
          description:
            'Build mode: "full" (first time, ID 1 to max), ' +
            '"update" (incremental from last indexed ID), ' +
            '"rebuild" (drop and recreate everything)',
          enum: ['full', 'update', 'rebuild'],
          default: 'update',
        },
        primeMinister: {
          type: 'string',
          description:
            'Limit to a specific PM (uses estimated ID range). ' +
            'Useful for quick testing or targeted indexing. ' +
            'Examples: "Hawke", "Howard", "Gillard"',
        },
        startId: {
          type: 'number',
          description: 'Custom start ID (overrides primeMinister)',
        },
        endId: {
          type: 'number',
          description: 'Custom end ID (overrides primeMinister)',
        },
        batchSize: {
          type: 'number',
          description: 'Transcripts per batch insert (default: 10)',
          default: 10,
        },
      },
    },
  },

  async execute(args: Record<string, unknown>) {
    const mode = (args.mode as BuildMode) ?? 'update';
    const primeMinister = args.primeMinister as string | undefined;
    const startId = args.startId as number | undefined;
    const endId = args.endId as number | undefined;
    const batchSize = (args.batchSize as number) ?? 10;

    // Determine ID range
    let idRange: { start: number; end: number } | undefined;

    if (startId !== undefined || endId !== undefined) {
      idRange = {
        start: startId ?? 1,
        end: endId ?? 40000,
      };
    } else if (primeMinister) {
      const pmRange = getPmIdRange(primeMinister);
      if (!pmRange) {
        return errorResponse(
          `Unknown Prime Minister: "${primeMinister}". ` +
            `Known PMs: ${getKnownPrimeMinisters().join(', ')}`
        );
      }
      idRange = pmRange;
    }

    // Provide estimate
    const rangeSize = idRange ? idRange.end - idRange.start + 1 : 40000;
    const _estimatedMinutes = Math.ceil((rangeSize * 0.1) / 60);

    try {
      // Build the index
      const result = await buildIndex({
        mode,
        idRange,
        batchSize,
        onProgress: (progress) => {
          // Progress is logged but not returned in streaming fashion
          // In a real implementation, this could use SSE or WebSocket
          if (progress.phase === 'error') {
            console.error('Build error:', progress.error);
          }
        },
      });

      if (result.phase === 'error') {
        return errorResponse(`Index build failed: ${result.error}`);
      }

      return successResponse({
        source: 'pm-transcripts',
        action: 'build_index',
        mode,
        phase: result.phase,
        stats: {
          total: result.total,
          processed: result.processed,
          indexed: result.indexed,
          skipped: result.skipped,
        },
        dbPath: PMTranscriptsStore.getDbPath(),
        message:
          result.phase === 'complete'
            ? `Successfully indexed ${result.indexed} transcripts`
            : `Build in progress: ${result.indexed} indexed so far`,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
