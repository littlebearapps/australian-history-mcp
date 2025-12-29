/**
 * Trove Search Tool - Search Trove's digitised collections
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import {
  TROVE_CATEGORIES,
  AU_STATES_WITH_NATIONAL,
  SORT_ORDERS_DATE,
  TROVE_AVAILABILITY,
  ILLUSTRATION_TYPES,
  TROVE_ILLUSTRATION_TYPES,
  TROVE_WORD_COUNTS,
  TROVE_ARTICLE_CATEGORIES,
  TROVE_RIGHTS,
} from '../../../core/enums.js';
import type { TroveSearchParams, TroveFacetField } from '../types.js';
import { TROVE_FACET_FIELDS } from '../types.js';

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
        // Faceted search
        includeFacets: { type: 'boolean', description: PARAMS.INCLUDE_FACETS, default: false },
        facetFields: { type: 'array', items: { type: 'string', enum: TROVE_FACET_FIELDS }, description: PARAMS.FACET_FIELDS },
        // NEW: Newspaper-specific filters
        illustrationTypes: {
          type: 'array',
          items: { type: 'string', enum: TROVE_ILLUSTRATION_TYPES },
          description: 'Filter by illustration types (Photo, Cartoon, Map, Illustration, Graph)',
        },
        wordCount: {
          type: 'string',
          enum: TROVE_WORD_COUNTS,
          description: 'Filter by article word count range',
        },
        articleCategory: {
          type: 'string',
          enum: TROVE_ARTICLE_CATEGORIES,
          description: 'Filter by newspaper article category (Article, Advertising, Family Notices, etc.)',
        },
        // NEW: User-contributed content
        includeTags: { type: 'boolean', description: 'Include user-added tags in results', default: false },
        includeComments: { type: 'boolean', description: 'Include user corrections/comments in results', default: false },
        hasTags: { type: 'boolean', description: 'Only return items that have user tags', default: false },
        hasComments: { type: 'boolean', description: 'Only return items that have user comments', default: false },
        // NEW: Rights and content availability
        rights: {
          type: 'string',
          enum: TROVE_RIGHTS,
          description: 'Filter by copyright/rights status for reusable content',
        },
        fullTextAvailable: { type: 'boolean', description: 'Only return items with downloadable full text', default: false },
        hasThumbnail: { type: 'boolean', description: 'Only return items with preview thumbnails', default: false },
        // NEW: Advanced date filtering
        year: { type: 'string', description: 'Specific year (requires decade to be set)' },
        month: { type: 'number', description: 'Specific month 1-12 (requires decade and year)', minimum: 1, maximum: 12 },
        // NEW: Collection/series filtering
        series: { type: 'string', description: 'Search within a series/collection (partial match, case-insensitive)' },
        journalTitle: { type: 'string', description: 'Filter magazine/journal articles by publication title' },
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
      // Faceted search
      includeFacets?: boolean;
      facetFields?: TroveFacetField[];
      // NEW: Newspaper-specific filters
      illustrationTypes?: string[];
      wordCount?: string;
      articleCategory?: string;
      // NEW: User-contributed content
      includeTags?: boolean;
      includeComments?: boolean;
      hasTags?: boolean;
      hasComments?: boolean;
      // NEW: Rights and content availability
      rights?: string;
      fullTextAvailable?: boolean;
      hasThumbnail?: boolean;
      // NEW: Advanced date filtering
      year?: string;
      month?: number;
      // NEW: Collection/series filtering
      series?: string;
      journalTitle?: string;
    };

    // Validate query is not empty
    if (!input.query || input.query.trim() === '') {
      return errorResponse('query cannot be empty');
    }

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

    // Collect parameter conflict warnings
    const warnings: string[] = [];

    // includeHoldings/includeLinks are ignored in search - only work with trove_get_work
    if (input.includeHoldings) {
      warnings.push('includeHoldings is ignored in trove_search - use trove_get_work with work ID to get holdings');
    }
    if (input.includeLinks) {
      warnings.push('includeLinks is ignored in trove_search - use trove_get_work with work ID to get links');
    }

    // hasThumbnail (imageInd) doesn't apply to newspaper category
    if (input.hasThumbnail && input.category === 'newspaper') {
      warnings.push('hasThumbnail does not apply to newspaper category');
    }

    // year requires decade to be set
    if (input.year && !input.decade) {
      warnings.push('year parameter requires decade to be set - add decade parameter (e.g., decade="193" for 1930s)');
    }

    // month requires both decade and year
    if (input.month && (!input.decade || !input.year)) {
      warnings.push('month parameter requires both decade and year to be set');
    }

    // NUC filtering doesn't work for newspaper/gazette categories
    if (input.nuc && (input.category === 'newspaper' || input.category === 'gazette')) {
      warnings.push('nuc filter does not work for newspaper/gazette categories - NLA-digitised content has no per-article NUC data');
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
        // Faceted search
        includeFacets: input.includeFacets,
        facetFields: input.facetFields,
        // NEW: Newspaper-specific filters
        illustrationTypes: input.illustrationTypes,
        wordCount: input.wordCount,
        articleCategory: input.articleCategory,
        // NEW: User-contributed content
        includeTags: input.includeTags,
        includeComments: input.includeComments,
        hasTags: input.hasTags,
        hasComments: input.hasComments,
        // NEW: Rights and content availability
        rights: input.rights,
        fullTextAvailable: input.fullTextAvailable,
        hasThumbnail: input.hasThumbnail,
        // NEW: Advanced date filtering
        year: input.year,
        month: input.month,
        // NEW: Collection/series filtering
        series: input.series,
        journalTitle: input.journalTitle,
      };

      const result = await troveClient.search(params);

      // Build response with optional facets
      const response: Record<string, unknown> = {
        source: 'trove',
        query: result.query,
        category: result.category,
        totalResults: result.totalResults,
        returned: result.records.length,
        nextCursor: result.nextStart,
        records: result.records.map(r => {
          if ('heading' in r) {
            // Newspaper/gazette article
            const articleRecord: Record<string, unknown> = {
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
            // Include tags if requested and present
            if (input.includeTags && r.tags && r.tags.length > 0) {
              articleRecord.tags = r.tags;
            }
            // Include comments if requested and present
            if (input.includeComments && r.comments && r.comments.length > 0) {
              articleRecord.comments = r.comments;
            }
            return articleRecord;
          } else {
            // Work (book, image, etc.)
            const workRecord: Record<string, unknown> = {
              id: r.id,
              type: 'work',
              title: r.title,
              contributor: r.contributor,
              issued: r.issued,
              format: r.type,
              url: r.troveUrl,
              thumbnailUrl: r.thumbnailUrl,
            };
            // Include tags if requested and present
            if (input.includeTags && r.tags && r.tags.length > 0) {
              workRecord.tags = r.tags;
            }
            // Include comments if requested and present
            if (input.includeComments && r.comments && r.comments.length > 0) {
              workRecord.comments = r.comments;
            }
            return workRecord;
          }
        }),
      };

      // Add facets if requested and available
      if (input.includeFacets && result.facets && result.facets.length > 0) {
        response.facets = result.facets.map(f => ({
          name: f.name,
          displayName: f.displayname,
          values: f.term.map(t => ({
            value: t.display,
            count: t.count,
          })),
        }));
      }

      // Add warnings for parameter conflicts
      if (warnings.length > 0) {
        response._warnings = warnings;
      }

      return successResponse(response);
    } catch (error) {
      return errorResponse(error);
    }
  },
};
