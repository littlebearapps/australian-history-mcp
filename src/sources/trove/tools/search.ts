/**
 * Trove Search Tool - Search Trove's digitised collections
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { TROVE_CATEGORIES, TROVE_STATES, type TroveSearchParams } from '../types.js';

export const troveSearchTool: SourceTool = {
  schema: {
    name: 'trove_search',
    description: 'Search Trove for Australian newspapers, gazettes, images, books, and magazines.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search terms',
        },
        category: {
          type: 'string',
          description: 'Content category to search',
          enum: TROVE_CATEGORIES,
          default: 'all',
        },
        state: {
          type: 'string',
          description: 'Filter by Australian state (for newspapers)',
          enum: TROVE_STATES,
        },
        dateFrom: {
          type: 'string',
          description: 'Start date (YYYY or YYYY-MM-DD)',
        },
        dateTo: {
          type: 'string',
          description: 'End date (YYYY or YYYY-MM-DD)',
        },
        format: {
          type: 'string',
          description: 'Format filter',
        },
        includeFullText: {
          type: 'boolean',
          description: 'Include full article text (newspapers only)',
          default: false,
        },
        nuc: {
          type: 'string',
          description: 'NUC code to filter by contributor/partner. Common codes: VSL (State Library Victoria), SLNSW (State Library NSW), ANL (National Library), QSL (State Library Queensland)',
        },
        illustrationType: {
          type: 'string',
          description: 'Filter by illustration type (for newspapers/magazines). Options: Illustrated, Not Illustrated',
          enum: ['Illustrated', 'Not Illustrated'],
        },
        limit: {
          type: 'number',
          description: 'Maximum results (1-100)',
          default: 20,
        },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query: string;
      category?: string;
      state?: string;
      dateFrom?: string;
      dateTo?: string;
      format?: string;
      includeFullText?: boolean;
      nuc?: string;
      illustrationType?: string;
      limit?: number;
    };

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured. See CLAUDE.md for setup instructions.');
    }

    try {
      // Convert illustrationType to API format
      let illustrated: 'Y' | 'N' | undefined;
      if (input.illustrationType === 'Illustrated') {
        illustrated = 'Y';
      } else if (input.illustrationType === 'Not Illustrated') {
        illustrated = 'N';
      }

      const params: TroveSearchParams = {
        query: input.query,
        category: input.category as TroveSearchParams['category'],
        state: input.state as TroveSearchParams['state'],
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        format: input.format,
        includeFullText: input.includeFullText ?? false,
        nuc: input.nuc,
        illustrated,
        limit: Math.min(input.limit ?? 20, 100),
      };

      const result = await troveClient.search(params);

      return successResponse({
        source: 'trove',
        query: result.query,
        category: result.category,
        totalResults: result.totalResults,
        returned: result.records.length,
        nextCursor: result.nextStart,
        records: result.records.map(r => {
          if ('heading' in r) {
            // Newspaper/gazette article
            return {
              id: r.id,
              type: 'article',
              heading: r.heading,
              newspaper: r.title,
              date: r.date,
              page: r.page,
              category: r.category,
              snippet: r.snippet?.substring(0, 200),
              url: r.troveUrl,
              pdfUrl: r.pdfUrl,
              illustrated: r.illustrated,
            };
          } else {
            // Work (book, image, etc.)
            return {
              id: r.id,
              type: 'work',
              title: r.title,
              contributor: r.contributor,
              issued: r.issued,
              format: r.type,
              url: r.troveUrl,
              thumbnailUrl: r.thumbnailUrl,
            };
          }
        }),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
