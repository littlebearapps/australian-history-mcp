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
    description: 'Search Trove for Australian newspapers, gazettes, images, books, and magazines. Supports sorting, advanced filters, search indexes, and holdings retrieval.',
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
        // NEW: Sorting
        sortby: {
          type: 'string',
          enum: ['relevance', 'datedesc', 'dateasc'],
          default: 'relevance',
          description: 'Sort order: relevance (default), datedesc (newest first), dateasc (oldest first)',
        },
        // NEW: Advanced filters
        decade: {
          type: 'string',
          description: 'Filter by decade (e.g., "199" for 1990s, "188" for 1880s)',
        },
        language: {
          type: 'string',
          description: 'Language filter (e.g., "english", "french")',
        },
        availability: {
          type: 'string',
          enum: ['online', 'free', 'restricted', 'subscription'],
          description: 'Online availability: online (any), free, restricted, subscription',
        },
        australian: {
          type: 'boolean',
          description: 'Filter to Australian content only',
        },
        firstAustralians: {
          type: 'boolean',
          description: 'Filter to First Nations content',
        },
        // NEW: Search indexes
        creator: {
          type: 'string',
          description: 'Search by author/creator name',
        },
        subject: {
          type: 'string',
          description: 'Search by subject term',
        },
        isbn: {
          type: 'string',
          description: 'Search by ISBN',
        },
        issn: {
          type: 'string',
          description: 'Search by ISSN',
        },
        // NEW: Include options
        includeHoldings: {
          type: 'boolean',
          default: false,
          description: 'Include library holdings (NUC codes, call numbers) in results',
        },
        includeLinks: {
          type: 'boolean',
          default: false,
          description: 'Include external links in results',
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
      // NEW parameters
      sortby?: 'relevance' | 'datedesc' | 'dateasc';
      decade?: string;
      language?: string;
      availability?: string;
      australian?: boolean;
      firstAustralians?: boolean;
      creator?: string;
      subject?: string;
      isbn?: string;
      issn?: string;
      includeHoldings?: boolean;
      includeLinks?: boolean;
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

      // Convert availability to API format
      let availability: 'y' | 'y/f' | 'y/r' | 'y/s' | undefined;
      if (input.availability === 'online') availability = 'y';
      else if (input.availability === 'free') availability = 'y/f';
      else if (input.availability === 'restricted') availability = 'y/r';
      else if (input.availability === 'subscription') availability = 'y/s';

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
        // NEW: Sorting
        sortby: input.sortby,
        // NEW: Advanced filters
        decade: input.decade,
        language: input.language,
        availability,
        australian: input.australian,
        firstAustralians: input.firstAustralians,
        // NEW: Search indexes
        creator: input.creator,
        subject: input.subject,
        isbn: input.isbn,
        issn: input.issn,
        // NEW: Include options
        includeHoldings: input.includeHoldings,
        includeLinks: input.includeLinks,
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
