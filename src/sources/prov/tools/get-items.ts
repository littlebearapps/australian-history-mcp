/**
 * PROV Get Items Tool - Get items within a series
 *
 * SEARCH-017: Related Records Discovery
 *
 * Returns items (records) within a PROV series (VPRS).
 * Useful for exploring the contents of a specific series.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { provClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { PROV_SORT_OPTIONS } from '../types.js';
import type { PROVSortOption } from '../types.js';

interface SeriesItem {
  id: string;
  title: string;
  description?: string;
  recordForm?: string;
  startDate?: string;
  endDate?: string;
  digitised: boolean;
  iiifManifest?: string;
  url: string;
}

interface PROVItemsResult {
  seriesId: string;
  seriesTitle?: string;
  totalItems: number;
  returned: number;
  offset: number;
  items: SeriesItem[];
}

export const provGetItemsTool: SourceTool = {
  schema: {
    name: 'prov_get_items',
    description: 'Get items (records) within a PROV series (VPRS number).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        series: {
          type: 'string',
          description: 'VPRS series number (e.g., "VPRS 515" or "515")',
        },
        query: {
          type: 'string',
          description: 'Optional text search within the series',
        },
        digitisedOnly: {
          type: 'boolean',
          description: 'Only return items that have been digitised (default: false)',
          default: false,
        },
        sortby: {
          type: 'string',
          description: PARAMS.SORT_BY,
          enum: PROV_SORT_OPTIONS,
          default: 'relevance',
        },
        limit: {
          type: 'number',
          description: 'Maximum items to return (default: 20, max: 100)',
          default: 20,
        },
        offset: {
          type: 'number',
          description: 'Offset for pagination (default: 0)',
          default: 0,
        },
      },
      required: ['series'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const series = args.series as string;
    const query = args.query as string | undefined;
    const digitisedOnly = args.digitisedOnly === true;
    const sortby = (args.sortby as PROVSortOption) ?? 'relevance';
    const limit = Math.min((args.limit as number) ?? 20, 100);
    const offset = (args.offset as number) ?? 0;

    if (!series || typeof series !== 'string') {
      return errorResponse('Series ID is required');
    }

    try {
      // Get series details first
      const seriesInfo = await provClient.getSeries(series);

      // Search for items in this series
      const searchResult = await provClient.search({
        query: query,
        series: series,
        digitisedOnly: digitisedOnly,
        sortby: sortby,
        rows: limit,
        start: offset,
      });

      // Map records to items
      const items: SeriesItem[] = searchResult.records.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        recordForm: r.recordForm,
        startDate: r.startDate,
        endDate: r.endDate,
        digitised: r.digitised,
        iiifManifest: r.iiifManifest,
        url: r.url,
      }));

      const result: PROVItemsResult = {
        seriesId: series,
        seriesTitle: seriesInfo?.title,
        totalItems: searchResult.totalResults,
        returned: items.length,
        offset,
        items,
      };

      return successResponse({
        source: 'prov',
        ...result,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
