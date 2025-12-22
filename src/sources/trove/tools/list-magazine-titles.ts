/**
 * Trove List Magazine Titles Tool - List available magazine titles
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';

export const troveListMagazineTitlesTool: SourceTool = {
  schema: {
    name: 'trove_list_magazine_titles',
    description: 'List magazine titles available in Trove. Returns publication metadata including date ranges and ISSN.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  async execute() {
    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    try {
      const titles = await troveClient.listMagazineTitles();

      return successResponse({
        source: 'trove',
        totalResults: titles.length,
        titles: titles.map((t) => ({
          id: t.id,
          title: t.title,
          publisher: t.publisher,
          dateRange: t.startDate && t.endDate
            ? `${t.startDate} - ${t.endDate}`
            : t.startDate || t.endDate,
          issn: t.issn,
          url: t.troveUrl,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
