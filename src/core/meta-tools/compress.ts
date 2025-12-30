/**
 * Compress Meta-Tool
 *
 * Phase 3: Reduce token usage by extracting essential fields from records
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import {
  compressRecordArray,
  dedupeRecords,
  isCompressionLevel,
} from '../compression/index.js';

export const compressMetaTool: SourceTool = {
  schema: {
    name: 'compress',
    description:
      'Compress search results to reduce token usage. Extracts essential fields based on compression level. Token targets: minimal (~20/record), standard (~50/record), full (~80/record).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        records: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of records to compress',
        },
        level: {
          type: 'string',
          enum: ['minimal', 'standard', 'full'],
          description:
            'Compression level. minimal: id, url, source. standard (default): + title, year. full: + type, creator.',
        },
        maxTitleLength: {
          type: 'number',
          description:
            'Maximum title length before truncation (default: 50). Truncates at word boundary.',
        },
        dedupeFirst: {
          type: 'boolean',
          description:
            'Remove duplicates before compressing (default: true). Saves additional tokens.',
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
        status: 'compressed',
        records: [],
        stats: {
          original: { count: 0, estimatedTokens: 0 },
          compressed: { count: 0, estimatedTokens: 0 },
          savings: { recordsRemoved: 0, tokenReduction: 0, percentageSaved: 0 },
        },
      });
    }

    // Validate level if provided
    const level = args.level as string | undefined;
    if (level && !isCompressionLevel(level)) {
      return errorResponse(
        `Invalid level "${level}". Must be one of: minimal, standard, full`
      );
    }

    // Validate maxTitleLength if provided
    const maxTitleLength = args.maxTitleLength as number | undefined;
    if (maxTitleLength !== undefined) {
      if (typeof maxTitleLength !== 'number' || maxTitleLength < 1) {
        return errorResponse('maxTitleLength must be a positive number');
      }
    }

    // Default dedupeFirst to true
    const dedupeFirst = args.dedupeFirst !== false;

    try {
      let recordsToCompress = records;
      let recordsRemoved = 0;

      // Optionally deduplicate first
      if (dedupeFirst) {
        const dedupeResult = dedupeRecords(records);
        recordsToCompress = dedupeResult.unique;
        recordsRemoved = dedupeResult.stats.removed;
      }

      // Compress records
      const result = compressRecordArray(recordsToCompress, {
        level: (level as 'minimal' | 'standard' | 'full') ?? 'standard',
        maxTitleLength,
      });

      return successResponse({
        status: 'compressed',
        records: result.compressed.records,
        stats: {
          original: {
            count: records.length,
            estimatedTokens: result.original.estimatedTokens,
          },
          compressed: {
            count: result.compressed.count,
            estimatedTokens: result.compressed.estimatedTokens,
          },
          savings: {
            recordsRemoved,
            tokenReduction: result.savings.tokenReduction,
            percentageSaved: result.savings.percentageSaved,
          },
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
