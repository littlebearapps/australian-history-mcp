/**
 * Trove Newspaper Tools - Article details and title listings
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { AU_STATES_WITH_NATIONAL, PUBLICATION_TYPES, type AUStateWithNational } from '../../../core/enums.js';

/**
 * Get full details of a newspaper/gazette article
 */
export const troveNewspaperArticleTool: SourceTool = {
  schema: {
    name: 'trove_newspaper_article',
    description: 'Get article details with OCR text and PDF.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        articleId: { type: 'string', description: PARAMS.ID },
        type: { type: 'string', description: PARAMS.TYPE, enum: PUBLICATION_TYPES, default: 'newspaper' },
        includeText: { type: 'boolean', description: PARAMS.INCLUDE_FULL_TEXT, default: true },
      },
      required: ['articleId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      articleId: string;
      type?: 'newspaper' | 'gazette';
      includeText?: boolean;
    };

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured. See CLAUDE.md for setup instructions.');
    }

    try {
      const type = input.type ?? 'newspaper';
      const includeText = input.includeText ?? true;

      const article = type === 'gazette'
        ? await troveClient.getGazetteArticle(input.articleId, includeText)
        : await troveClient.getNewspaperArticle(input.articleId, includeText);

      if (!article) {
        return errorResponse(`Article ${input.articleId} not found`);
      }

      return successResponse({
        source: 'trove',
        type,
        article: {
          id: article.id,
          heading: article.heading,
          newspaper: article.title,
          titleId: article.titleId,
          date: article.date,
          page: article.page,
          pageSequence: article.pageSequence,
          category: article.category,
          url: article.troveUrl,
          pdfUrl: article.pdfUrl,
          wordCount: article.wordCount,
          correctionCount: article.correctionCount,
          tagCount: article.tagCount,
          commentCount: article.commentCount,
          illustrated: article.illustrated,
          lastCorrected: article.lastCorrected,
          fullText: article.fullText,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * List available newspaper/gazette titles
 */
export const troveListTitlesTool: SourceTool = {
  schema: {
    name: 'trove_list_titles',
    description: 'List newspaper or gazette titles by state.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', description: PARAMS.TYPE, enum: PUBLICATION_TYPES, default: 'newspaper' },
        state: { type: 'string', description: PARAMS.STATE, enum: AU_STATES_WITH_NATIONAL },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      type?: 'newspaper' | 'gazette';
      state?: string;
    };

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured. See CLAUDE.md for setup instructions.');
    }

    try {
      const type = input.type ?? 'newspaper';
      const state = input.state as AUStateWithNational | undefined;

      const titles = type === 'gazette'
        ? await troveClient.listGazetteTitles(state)
        : await troveClient.listNewspaperTitles(state);

      return successResponse({
        source: 'trove',
        type,
        state: state ?? 'all',
        count: titles.length,
        titles: titles.map(t => ({
          id: t.id,
          title: t.title,
          state: t.state,
          issn: t.issn,
          dateRange: `${t.startDate} - ${t.endDate}`,
          url: t.troveUrl,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Get detailed information about a specific title
 */
export const troveTitleDetailsTool: SourceTool = {
  schema: {
    name: 'trove_title_details',
    description: 'Get title details with years and issues.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        titleId: { type: 'string', description: PARAMS.ID },
        type: { type: 'string', description: PARAMS.TYPE, enum: PUBLICATION_TYPES, default: 'newspaper' },
        includeYears: { type: 'boolean', description: PARAMS.INCLUDE_YEARS, default: true },
        dateFrom: { type: 'string', description: PARAMS.DATE_FROM },
        dateTo: { type: 'string', description: PARAMS.DATE_TO },
      },
      required: ['titleId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      titleId: string;
      type?: 'newspaper' | 'gazette';
      includeYears?: boolean;
      dateFrom?: string;
      dateTo?: string;
    };

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured. See CLAUDE.md for setup instructions.');
    }

    try {
      const type = input.type ?? 'newspaper';

      const dateRange = input.dateFrom && input.dateTo
        ? { from: input.dateFrom, to: input.dateTo }
        : undefined;

      const detail = await troveClient.getTitleDetails(input.titleId, {
        type,
        includeYears: input.includeYears ?? true,
        dateRange,
      });

      if (!detail) {
        return errorResponse(`Title ${input.titleId} not found`);
      }

      return successResponse({
        source: 'trove',
        type,
        title: {
          id: detail.id,
          title: detail.title,
          state: detail.state,
          issn: detail.issn,
          dateRange: `${detail.startDate} - ${detail.endDate}`,
          url: detail.troveUrl,
          years: detail.years,
          issues: detail.issues,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
