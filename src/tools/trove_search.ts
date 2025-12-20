/**
 * Trove Search Tool - Search the National Library of Australia's Trove collection
 */

import { createTroveClient } from '../clients/trove_client.js';
import type { MCPToolResponse, TroveCategory, TroveState } from '../types.js';

export const troveSearchSchema = {
  name: 'trove_search',
  description: `Search Trove (National Library of Australia) for digitised Australian content.

Use this to find:
- Historical newspaper articles
- Government gazettes (official notices)
- Images, photographs, and maps
- Books and research materials
- Magazines and periodicals

Trove aggregates content from libraries, museums, and archives across Australia.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search terms (e.g., "Melbourne flood 1934", "council rates")',
      },
      category: {
        type: 'string',
        description: 'Content category to search',
        enum: ['all', 'newspaper', 'gazette', 'magazine', 'image', 'book', 'diary', 'music', 'research'],
        default: 'all',
      },
      state: {
        type: 'string',
        description: 'Filter by Australian state (for newspapers)',
        enum: ['vic', 'nsw', 'qld', 'sa', 'wa', 'tas', 'nt', 'act', 'national'],
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
        description: 'Format filter (e.g., "Photograph", "Map", "Book")',
      },
      includeFullText: {
        type: 'boolean',
        description: 'Include full article text (newspapers only)',
        default: false,
      },
      limit: {
        type: 'number',
        description: 'Maximum results (1-100)',
        default: 20,
      },
    },
    required: ['query'],
  },
};

export async function executeTroveSearch(input: {
  query: string;
  category?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: string;
  includeFullText?: boolean;
  limit?: number;
}): Promise<MCPToolResponse> {
  try {
    const client = createTroveClient();

    if (!client.hasApiKey()) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'TROVE_API_KEY not configured. Apply for a key at https://trove.nla.gov.au/about/create-something/using-api',
          }),
        }],
        isError: true,
      };
    }

    const result = await client.search({
      query: input.query,
      category: (input.category as TroveCategory) ?? 'all',
      state: input.state as TroveState,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      format: input.format,
      includeFullText: input.includeFullText,
      limit: Math.min(input.limit ?? 20, 100),
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'trove',
          query: result.query,
          category: result.category,
          totalResults: result.totalResults,
          returned: result.records.length,
          nextCursor: result.nextStart,
          records: result.records.map(r => {
            if ('heading' in r) {
              // Newspaper article
              return {
                type: 'article',
                id: r.id,
                heading: r.heading,
                newspaper: r.title,
                date: r.date,
                page: r.page,
                category: r.category,
                snippet: r.snippet,
                fullText: r.fullText?.substring(0, 500),
                url: r.troveUrl,
                illustrated: r.illustrated,
              };
            } else {
              // Work (book, image, etc.)
              return {
                type: 'work',
                id: r.id,
                title: r.title,
                contributor: r.contributor,
                issued: r.issued,
                format: r.type,
                abstract: r.abstract?.substring(0, 200),
                url: r.troveUrl,
                thumbnail: r.thumbnailUrl,
              };
            }
          }),
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      }],
      isError: true,
    };
  }
}
