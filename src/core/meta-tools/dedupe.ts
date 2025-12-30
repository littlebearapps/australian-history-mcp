/**
 * Dedupe Meta-Tool
 *
 * Phase 3: Remove duplicate records from a batch of results
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { dedupeRecords, isDedupeStrategy } from '../compression/index.js';

export const dedupeMetaTool: SourceTool = {
  schema: {
    name: 'dedupe',
    description:
      'Remove duplicate records from search results. Uses URL matching (primary) and title similarity (fallback). Returns unique records with duplicate statistics.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        records: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of records to deduplicate',
        },
        strategy: {
          type: 'string',
          enum: ['url', 'title', 'both'],
          description:
            'Matching strategy: "url" (exact URL match), "title" (Jaccard similarity), "both" (default)',
        },
        titleThreshold: {
          type: 'number',
          description:
            'Jaccard similarity threshold for title matching (0-1, default: 0.85 same-source, 0.90 cross-source)',
        },
        yearProximity: {
          type: 'number',
          description:
            'Maximum year difference for title-based matching (default: 2)',
        },
        preferSource: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Source priority order for keeping records when duplicates found. Default: trove, prov, nma, museums-victoria, vhd, acmi, ghap, ala, pm-transcripts, iiif, ga-hap',
        },
      },
      required: ['records'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const records = args.records as Record<string, unknown>[] | undefined;

    if (!records || !Array.isArray(records)) {
      return errorResponse('records array is required');
    }

    if (records.length === 0) {
      return successResponse({
        status: 'deduplicated',
        unique: [],
        duplicates: [],
        stats: {
          original: 0,
          unique: 0,
          removed: 0,
          byMatchType: { url: 0, title: 0 },
        },
      });
    }

    // Validate strategy if provided
    const strategy = args.strategy as string | undefined;
    if (strategy && !isDedupeStrategy(strategy)) {
      return errorResponse(
        `Invalid strategy "${strategy}". Must be one of: url, title, both`
      );
    }

    // Validate titleThreshold if provided
    const titleThreshold = args.titleThreshold as number | undefined;
    if (titleThreshold !== undefined) {
      if (typeof titleThreshold !== 'number' || titleThreshold < 0 || titleThreshold > 1) {
        return errorResponse('titleThreshold must be a number between 0 and 1');
      }
    }

    // Validate yearProximity if provided
    const yearProximity = args.yearProximity as number | undefined;
    if (yearProximity !== undefined) {
      if (typeof yearProximity !== 'number' || yearProximity < 0) {
        return errorResponse('yearProximity must be a non-negative number');
      }
    }

    // Validate preferSource if provided
    const preferSource = args.preferSource as string[] | undefined;
    if (preferSource !== undefined) {
      if (!Array.isArray(preferSource)) {
        return errorResponse('preferSource must be an array of strings');
      }
    }

    try {
      const result = dedupeRecords(records, {
        strategy: strategy as 'url' | 'title' | 'both' | undefined,
        titleThreshold,
        yearProximity,
        preferSource,
      });

      return successResponse({
        status: 'deduplicated',
        unique: result.unique,
        duplicates: result.duplicates,
        stats: result.stats,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
