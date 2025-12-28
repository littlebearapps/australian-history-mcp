/**
 * PM Transcripts Full-Text Search Tool
 *
 * SEARCH-018: Full-text search using SQLite FTS5 index
 *
 * Provides fast, local full-text search of PM Transcripts
 * with BM25 ranking and highlighted snippets.
 *
 * Requires index to be built first with pm_transcripts_build_index.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { PMTranscriptsStore, pmTranscriptsStore } from '../index/sqlite-store.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const pmTranscriptsSearchTool: SourceTool = {
  schema: {
    name: 'pm_transcripts_search',
    description:
      'Full-text search of PM Transcripts using local FTS5 index. ' +
      'Supports FTS5 query syntax: AND, OR, NOT, "phrases", prefix*. ' +
      'Requires index to be built first with pm_transcripts_build_index.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description:
            'FTS5 search query. Examples: "climate change", economy AND budget, ' +
            'health NOT covid, "prime minister" AND (speech OR address)',
        },
        primeMinister: {
          type: 'string',
          description: 'Filter by Prime Minister name (partial match)',
        },
        releaseType: {
          type: 'string',
          description: 'Filter by release type (e.g., "Speech", "Media Release", "Interview")',
        },
        dateFrom: {
          type: 'string',
          description: PARAMS.DATE_FROM,
        },
        dateTo: {
          type: 'string',
          description: PARAMS.DATE_TO,
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 20, max: 100)',
          default: 20,
        },
        offset: {
          type: 'number',
          description: PARAMS.OFFSET,
          default: 0,
        },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const query = args.query as string;

    if (!query || typeof query !== 'string') {
      return errorResponse('Query is required');
    }

    // Check if index exists
    if (!PMTranscriptsStore.exists()) {
      return errorResponse(
        'Index not found. Run pm_transcripts_build_index first to create the search index. ' +
          'Example: pm_transcripts_build_index(mode="full")'
      );
    }

    const store = pmTranscriptsStore;

    try {
      store.open();

      const { results, total } = store.search({
        query,
        primeMinister: args.primeMinister as string | undefined,
        releaseType: args.releaseType as string | undefined,
        dateFrom: args.dateFrom as string | undefined,
        dateTo: args.dateTo as string | undefined,
        limit: args.limit as number | undefined,
        offset: args.offset as number | undefined,
      });

      return successResponse({
        source: 'pm-transcripts',
        totalResults: total,
        returned: results.length,
        offset: (args.offset as number) ?? 0,
        query,
        results: results.map((r) => ({
          transcriptId: r.transcriptId,
          title: r.title,
          primeMinister: r.primeMinister,
          releaseType: r.releaseType,
          releaseDate: r.releaseDateIso,
          subjects: r.subjects,
          snippet: r.snippet,
          score: r.score,
          documentUrl: r.documentUrl,
          url: `https://pmtranscripts.pmc.gov.au/release/transcript-${r.transcriptId}`,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    } finally {
      store.close();
    }
  },
};
