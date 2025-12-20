/**
 * Trove Newspaper Tools - Get article details and list titles
 */

import { createTroveClient } from '../clients/trove_client.js';
import type { MCPToolResponse, TroveState } from '../types.js';

// ============================================================================
// Get Newspaper Article
// ============================================================================

export const troveNewspaperArticleSchema = {
  name: 'trove_newspaper_article',
  description: `Get the full details of a newspaper or gazette article from Trove.

Use this after searching to retrieve:
- Complete article text (OCR)
- PDF link for the original page
- Correction and tag counts
- Full metadata`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      articleId: {
        type: 'string',
        description: 'The Trove article ID (from search results)',
      },
      type: {
        type: 'string',
        description: 'Article type',
        enum: ['newspaper', 'gazette'],
        default: 'newspaper',
      },
      includeText: {
        type: 'boolean',
        description: 'Include the full OCR text of the article',
        default: true,
      },
    },
    required: ['articleId'],
  },
};

export async function executeTroveNewspaperArticle(input: {
  articleId: string;
  type?: 'newspaper' | 'gazette';
  includeText?: boolean;
}): Promise<MCPToolResponse> {
  try {
    const client = createTroveClient();

    if (!client.hasApiKey()) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'TROVE_API_KEY not configured',
          }),
        }],
        isError: true,
      };
    }

    const article = input.type === 'gazette'
      ? await client.getGazetteArticle(input.articleId, input.includeText ?? true)
      : await client.getNewspaperArticle(input.articleId, input.includeText ?? true);

    if (!article) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Article ${input.articleId} not found`,
          }),
        }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'trove',
          article: {
            id: article.id,
            heading: article.heading,
            newspaper: article.title,
            newspaperId: article.titleId,
            date: article.date,
            page: article.page,
            category: article.category,
            wordCount: article.wordCount,
            correctionCount: article.correctionCount,
            illustrated: article.illustrated,
            url: article.troveUrl,
            pdfUrl: article.pdfUrl,
            fullText: article.fullText,
          },
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

// ============================================================================
// List Newspaper Titles
// ============================================================================

export const troveListTitlesSchema = {
  name: 'trove_list_titles',
  description: `List available newspaper or gazette titles in Trove.

Use this to discover what publications are available for a particular state.
Returns publication dates and issue counts.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      type: {
        type: 'string',
        description: 'Type of publication',
        enum: ['newspaper', 'gazette'],
        default: 'newspaper',
      },
      state: {
        type: 'string',
        description: 'Filter by state',
        enum: ['vic', 'nsw', 'qld', 'sa', 'wa', 'tas', 'nt', 'act', 'national'],
      },
    },
    required: [],
  },
};

export async function executeTroveListTitles(input: {
  type?: 'newspaper' | 'gazette';
  state?: string;
}): Promise<MCPToolResponse> {
  try {
    const client = createTroveClient();

    if (!client.hasApiKey()) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'TROVE_API_KEY not configured',
          }),
        }],
        isError: true,
      };
    }

    const titles = input.type === 'gazette'
      ? await client.listGazetteTitles(input.state)
      : await client.listNewspaperTitles(input.state as TroveState);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'trove',
          type: input.type ?? 'newspaper',
          state: input.state ?? 'all',
          count: titles.length,
          titles: titles.map(t => ({
            id: t.id,
            title: t.title,
            state: t.state,
            issn: t.issn,
            dateRange: `${t.startDate} - ${t.endDate}`,
            url: t.troveUrl,
          })),
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

// ============================================================================
// Get Title Details
// ============================================================================

export const troveTitleDetailsSchema = {
  name: 'trove_title_details',
  description: `Get detailed information about a newspaper or gazette title.

Use this to find:
- Available years and issue counts
- Specific issue dates for a date range`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      titleId: {
        type: 'string',
        description: 'The Trove title ID',
      },
      type: {
        type: 'string',
        description: 'Type of publication',
        enum: ['newspaper', 'gazette'],
        default: 'newspaper',
      },
      includeYears: {
        type: 'boolean',
        description: 'Include list of available years',
        default: true,
      },
      dateFrom: {
        type: 'string',
        description: 'Start of date range for issue list (YYYYMMDD)',
      },
      dateTo: {
        type: 'string',
        description: 'End of date range for issue list (YYYYMMDD)',
      },
    },
    required: ['titleId'],
  },
};

export async function executeTroveTitleDetails(input: {
  titleId: string;
  type?: 'newspaper' | 'gazette';
  includeYears?: boolean;
  dateFrom?: string;
  dateTo?: string;
}): Promise<MCPToolResponse> {
  try {
    const client = createTroveClient();

    if (!client.hasApiKey()) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'TROVE_API_KEY not configured',
          }),
        }],
        isError: true,
      };
    }

    const details = await client.getTitleDetails(input.titleId, {
      type: input.type,
      includeYears: input.includeYears ?? true,
      dateRange: input.dateFrom && input.dateTo
        ? { from: input.dateFrom, to: input.dateTo }
        : undefined,
    });

    if (!details) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Title ${input.titleId} not found`,
          }),
        }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'trove',
          title: {
            id: details.id,
            name: details.title,
            state: details.state,
            issn: details.issn,
            dateRange: `${details.startDate} - ${details.endDate}`,
            url: details.troveUrl,
            years: details.years,
            issues: details.issues,
          },
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
