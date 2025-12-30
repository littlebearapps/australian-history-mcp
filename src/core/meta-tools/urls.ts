/**
 * URLs Meta-Tool
 *
 * Phase 3: Extract URLs from records for quick reference/bookmarking
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import {
  dedupeRecords,
  normaliseUrl,
  estimateTokens,
} from '../compression/index.js';
import type { ExtractedUrl } from '../compression/index.js';

/**
 * Extract URL from a record (checking common field names)
 */
function extractUrl(record: Record<string, unknown>): string | undefined {
  const urlFields = ['url', 'link', 'href', 'webUrl', 'recordUrl', 'manifestUrl'];

  for (const field of urlFields) {
    const value = record[field];
    if (typeof value === 'string' && value.startsWith('http')) {
      return value;
    }
  }

  // Check nested links
  if (typeof record.links === 'object' && record.links !== null) {
    const links = record.links as Record<string, unknown>;
    if (typeof links.self === 'string') return links.self;
    if (typeof links.html === 'string') return links.html;
  }

  return undefined;
}

/**
 * Extract title from a record
 */
function extractTitle(record: Record<string, unknown>): string | undefined {
  const titleFields = ['title', 'name', 'heading', 'label'];

  for (const field of titleFields) {
    const value = record[field];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

/**
 * Extract source from a record
 */
function extractSource(record: Record<string, unknown>): string {
  if (typeof record.source === 'string') return record.source;
  if (typeof record._source === 'string') return record._source;
  return 'unknown';
}

export const urlsMetaTool: SourceTool = {
  schema: {
    name: 'urls',
    description:
      'Extract URLs from search results for quick reference or bookmarking. Returns minimal token output with just URLs, sources, and optional titles.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        records: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of records to extract URLs from',
        },
        includeTitle: {
          type: 'boolean',
          description: 'Include title with each URL (default: true)',
        },
        dedupeFirst: {
          type: 'boolean',
          description: 'Remove duplicate records before extraction (default: true)',
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
        status: 'extracted',
        urls: [],
        count: 0,
        estimatedTokens: 0,
      });
    }

    // Default includeTitle to true
    const includeTitle = args.includeTitle !== false;

    // Default dedupeFirst to true
    const dedupeFirst = args.dedupeFirst !== false;

    try {
      let recordsToProcess = records;

      // Optionally deduplicate first
      if (dedupeFirst) {
        const dedupeResult = dedupeRecords(records);
        recordsToProcess = dedupeResult.unique;
      }

      // Extract URLs
      const urls: ExtractedUrl[] = [];
      const seenUrls = new Set<string>();

      for (const record of recordsToProcess) {
        const url = extractUrl(record);
        if (!url) continue;

        // Deduplicate URLs
        const normalisedUrl = normaliseUrl(url);
        if (seenUrls.has(normalisedUrl)) continue;
        seenUrls.add(normalisedUrl);

        const extracted: ExtractedUrl = {
          url,
          source: extractSource(record),
        };

        if (includeTitle) {
          const title = extractTitle(record);
          if (title) {
            extracted.title = title;
          }
        }

        urls.push(extracted);
      }

      return successResponse({
        status: 'extracted',
        urls,
        count: urls.length,
        estimatedTokens: estimateTokens(urls),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
