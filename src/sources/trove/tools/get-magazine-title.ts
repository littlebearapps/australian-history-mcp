/**
 * Trove Get Magazine Title Tool - Get magazine title details with years/issues
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
export const troveGetMagazineTitleTool: SourceTool = {
  schema: {
    name: 'trove_get_magazine_title',
    description: 'Get detailed information about a Trove magazine title by ID, including available years and issues.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        titleId: {
          type: 'string',
          description: 'The magazine title ID from trove_list_magazine_titles',
        },
        includeYears: {
          type: 'boolean',
          default: true,
          description: 'Include list of available years with issue counts',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date for issue list (YYYYMMDD format)',
        },
        dateTo: {
          type: 'string',
          description: 'End date for issue list (YYYYMMDD format)',
        },
      },
      required: ['titleId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      titleId?: string;
      includeYears?: boolean;
      dateFrom?: string;
      dateTo?: string;
    };

    if (!input.titleId) {
      return errorResponse('titleId is required');
    }

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    // Build date range if provided
    let dateRange: string | undefined;
    if (input.dateFrom && input.dateTo) {
      dateRange = `${input.dateFrom}-${input.dateTo}`;
    } else if (input.dateFrom) {
      dateRange = `${input.dateFrom}-`;
    } else if (input.dateTo) {
      dateRange = `-${input.dateTo}`;
    }

    try {
      const title = await troveClient.getMagazineTitle(input.titleId, {
        includeYears: input.includeYears !== false,
        dateRange,
      });

      if (!title) {
        return errorResponse(`Magazine title not found: ${input.titleId}`);
      }

      const response: Record<string, unknown> = {
        source: 'trove',
        title: {
          id: title.id,
          title: title.title,
          publisher: title.publisher,
          place: title.place,
          issn: title.issn,
          dateRange: title.startDate && title.endDate
            ? `${title.startDate} - ${title.endDate}`
            : title.startDate || title.endDate,
          url: title.troveUrl,
        },
      };

      // Include years if available
      if (title.years && title.years.length > 0) {
        response.years = title.years.map((y) => ({
          year: y.year,
          issueCount: y.issueCount,
          issues: y.issues?.map((i) => ({
            id: i.id,
            date: i.date,
            url: i.url,
          })),
        }));
        response.totalYears = title.years.length;
        response.totalIssues = title.years.reduce((sum, y) => sum + y.issueCount, 0);
      }

      return successResponse(response);
    } catch (error) {
      return errorResponse(error);
    }
  },
};
