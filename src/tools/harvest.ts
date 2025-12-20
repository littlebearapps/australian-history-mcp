/**
 * Harvest Tools - Bulk download records from PROV and Trove
 */

import { provClient } from '../clients/prov_client.js';
import { createTroveClient } from '../clients/trove_client.js';
import type { MCPToolResponse, TroveCategory, TroveState } from '../types.js';

// ============================================================================
// PROV Harvest
// ============================================================================

export const provHarvestSchema = {
  name: 'prov_harvest',
  description: `Bulk download records from the PROV (Public Record Office Victoria) collection.

Use this for batch harvesting of:
- Historical photographs
- Maps and plans
- Government files and records
- Council meeting minutes

Returns paginated results for large datasets.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search text',
      },
      series: {
        type: 'string',
        description: 'VPRS series number',
      },
      agency: {
        type: 'string',
        description: 'VA agency number',
      },
      recordForm: {
        type: 'string',
        description: 'Type of record',
        enum: ['photograph', 'map', 'file', 'volume', 'plan', 'drawing', 'register'],
      },
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)',
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY-MM-DD)',
      },
      digitisedOnly: {
        type: 'boolean',
        description: 'Only digitised records',
        default: false,
      },
      maxRecords: {
        type: 'number',
        description: 'Maximum records to harvest (1-1000)',
        default: 100,
      },
      startFrom: {
        type: 'number',
        description: 'Offset for pagination',
        default: 0,
      },
    },
    required: [],
  },
};

export async function executePROVHarvest(input: {
  query?: string;
  series?: string;
  agency?: string;
  recordForm?: string;
  dateFrom?: string;
  dateTo?: string;
  digitisedOnly?: boolean;
  maxRecords?: number;
  startFrom?: number;
}): Promise<MCPToolResponse> {
  try {
    if (!input.query && !input.series && !input.agency) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'At least one of query, series, or agency is required',
          }),
        }],
        isError: true,
      };
    }

    const maxRecords = Math.min(input.maxRecords ?? 100, 1000);
    const batchSize = 100;
    let start = input.startFrom ?? 0;
    const allRecords: any[] = [];
    let totalAvailable = 0;

    // Harvest in batches
    while (allRecords.length < maxRecords) {
      const remaining = maxRecords - allRecords.length;
      const rows = Math.min(batchSize, remaining);

      const result = await provClient.search({
        query: input.query,
        series: input.series,
        agency: input.agency,
        recordForm: input.recordForm,
        startDate: input.dateFrom,
        endDate: input.dateTo,
        digitisedOnly: input.digitisedOnly ?? false,
        rows,
        start,
      });

      totalAvailable = result.totalResults;
      allRecords.push(...result.records);

      // Stop if no more results
      if (result.records.length < rows) {
        break;
      }

      start += rows;
    }

    const hasMore = allRecords.length < totalAvailable;
    const nextOffset = hasMore ? start.toString() : undefined;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'prov',
          harvested: allRecords.length,
          totalAvailable,
          hasMore,
          nextOffset,
          records: allRecords.map((r: any) => ({
            id: r.id,
            title: r.title,
            series: r.series,
            agency: r.agency,
            recordForm: r.recordForm,
            dateRange: r.startDate && r.endDate
              ? `${r.startDate} - ${r.endDate}`
              : r.startDate || r.endDate,
            digitised: r.digitised,
            url: r.url,
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
// Trove Harvest
// ============================================================================

export const troveHarvestSchema = {
  name: 'trove_harvest',
  description: `Bulk download records from Trove (National Library of Australia).

Use this for batch harvesting of:
- Newspaper articles for a topic/date range
- Historical images and maps
- Government publications
- Research materials

Uses stable cursor-based pagination for reliable harvesting.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search terms',
      },
      category: {
        type: 'string',
        description: 'Content category',
        enum: ['all', 'newspaper', 'gazette', 'magazine', 'image', 'book', 'diary', 'music', 'research'],
        default: 'all',
      },
      state: {
        type: 'string',
        description: 'Filter by state (newspapers)',
        enum: ['vic', 'nsw', 'qld', 'sa', 'wa', 'tas', 'nt', 'act', 'national'],
      },
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY)',
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY)',
      },
      format: {
        type: 'string',
        description: 'Format filter (e.g., "Photograph", "Map")',
      },
      maxRecords: {
        type: 'number',
        description: 'Maximum records to harvest (1-1000)',
        default: 100,
      },
      cursor: {
        type: 'string',
        description: 'Pagination cursor from previous harvest',
      },
      includeFullText: {
        type: 'boolean',
        description: 'Include article text (newspapers only)',
        default: false,
      },
    },
    required: ['query'],
  },
};

export async function executeTroveHarvest(input: {
  query: string;
  category?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: string;
  maxRecords?: number;
  cursor?: string;
  includeFullText?: boolean;
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

    const maxRecords = Math.min(input.maxRecords ?? 100, 1000);
    const batchSize = 100; // Trove max per request
    let cursor = input.cursor ?? '*';
    const allRecords: any[] = [];
    let totalAvailable = 0;

    // Harvest in batches using bulk harvest mode
    while (allRecords.length < maxRecords) {
      const remaining = maxRecords - allRecords.length;
      const limit = Math.min(batchSize, remaining);

      const result = await client.search({
        query: input.query,
        category: (input.category as TroveCategory) ?? 'all',
        state: input.state as TroveState,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        format: input.format,
        limit,
        start: cursor,
        bulkHarvest: true,
        includeFullText: input.includeFullText,
      });

      totalAvailable = result.totalResults;
      allRecords.push(...result.records);

      // Stop if no more results or no next cursor
      if (!result.nextStart || result.records.length < limit) {
        cursor = result.nextStart ?? '';
        break;
      }

      cursor = result.nextStart;
    }

    const hasMore = allRecords.length < totalAvailable;
    const nextCursor = cursor && hasMore ? cursor : undefined;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'trove',
          harvested: allRecords.length,
          totalAvailable,
          hasMore,
          nextCursor,
          records: allRecords.map((r: any) => {
            if ('heading' in r) {
              return {
                type: 'article',
                id: r.id,
                heading: r.heading,
                newspaper: r.title,
                date: r.date,
                url: r.troveUrl,
              };
            } else {
              return {
                type: 'work',
                id: r.id,
                title: r.title,
                format: r.type,
                issued: r.issued,
                url: r.troveUrl,
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
