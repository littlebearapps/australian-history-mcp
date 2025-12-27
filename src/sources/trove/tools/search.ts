/**
 * Trove Search Tool - Search Trove's digitised collections
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { TROVE_CATEGORIES, AU_STATES_WITH_NATIONAL, SORT_ORDERS_DATE, TROVE_AVAILABILITY, ILLUSTRATION_TYPES } from '../../../core/enums.js';
import type { TroveSearchParams } from '../types.js';

export const troveSearchTool: SourceTool = {
  schema: {
    name: 'trove_search',
    description: 'Search Australian newspapers, gazettes, images, books.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        category: { type: 'string', description: PARAMS.CATEGORY, enum: TROVE_CATEGORIES, default: 'all' },
        state: { type: 'string', description: PARAMS.STATE, enum: AU_STATES_WITH_NATIONAL },
        dateFrom: { type: 'string', description: PARAMS.DATE_FROM },
        dateTo: { type: 'string', description: PARAMS.DATE_TO },
        format: { type: 'string', description: PARAMS.FORMAT },
        includeFullText: { type: 'boolean', description: PARAMS.INCLUDE_FULL_TEXT, default: false },
        nuc: { type: 'string', description: PARAMS.NUC },
        illustrationType: { type: 'string', description: PARAMS.ILLUSTRATION_TYPE, enum: ILLUSTRATION_TYPES },
        limit: { type: 'number', description: PARAMS.LIMIT, default: 20 },
        sortby: { type: 'string', description: PARAMS.SORT_BY, enum: SORT_ORDERS_DATE, default: 'relevance' },
        decade: { type: 'string', description: PARAMS.DECADE },
        language: { type: 'string', description: PARAMS.LANGUAGE },
        availability: { type: 'string', description: PARAMS.AVAILABILITY, enum: TROVE_AVAILABILITY },
        australian: { type: 'boolean', description: PARAMS.AUSTRALIAN },
        firstAustralians: { type: 'boolean', description: PARAMS.FIRST_NATIONS },
        creator: { type: 'string', description: PARAMS.CREATOR },
        subject: { type: 'string', description: PARAMS.SUBJECT },
        isbn: { type: 'string', description: PARAMS.ISBN },
        issn: { type: 'string', description: PARAMS.ISSN },
        includeHoldings: { type: 'boolean', description: PARAMS.INCLUDE_HOLDINGS, default: false },
        includeLinks: { type: 'boolean', description: PARAMS.INCLUDE_LINKS, default: false },
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

    // Validate date formats (YYYY, YYYY-MM, or YYYY-MM-DD)
    const dateRegex = /^\d{4}(-\d{2}(-\d{2})?)?$/;
    if (input.dateFrom && !dateRegex.test(input.dateFrom)) {
      return errorResponse(
        `Invalid dateFrom format: "${input.dateFrom}". Use YYYY, YYYY-MM, or YYYY-MM-DD (e.g., 1920, 1920-03, 1920-03-15).`
      );
    }
    if (input.dateTo && !dateRegex.test(input.dateTo)) {
      return errorResponse(
        `Invalid dateTo format: "${input.dateTo}". Use YYYY, YYYY-MM, or YYYY-MM-DD (e.g., 1920, 1920-03, 1920-03-15).`
      );
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
