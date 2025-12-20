/**
 * PROV Search Tool - Search the Public Record Office Victoria collection
 */

import { provClient } from '../clients/prov_client.js';
import type { MCPToolResponse, PROVSearchParams } from '../types.js';

export const provSearchSchema = {
  name: 'prov_search',
  description: `Search the Public Record Office Victoria (PROV) collection for Victorian state government archives.

Use this to find:
- Historical photographs and maps
- Government records and files
- Council meeting minutes
- State agency records

PROV holds records from Victorian state government agencies, local councils, and courts.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search text (e.g., "Melbourne Town Hall", "Fitzroy council")',
      },
      series: {
        type: 'string',
        description: 'VPRS series number (e.g., "VPRS 515" or "515")',
      },
      agency: {
        type: 'string',
        description: 'VA agency number (e.g., "VA 473" or "473")',
      },
      recordForm: {
        type: 'string',
        description: 'Type of record (e.g., "photograph", "map", "file", "volume")',
        enum: ['photograph', 'map', 'file', 'volume', 'plan', 'drawing', 'register'],
      },
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD or YYYY)',
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY-MM-DD or YYYY)',
      },
      digitisedOnly: {
        type: 'boolean',
        description: 'Only return records with digitised images',
        default: false,
      },
      limit: {
        type: 'number',
        description: 'Maximum results to return (1-100)',
        default: 20,
      },
    },
    required: [],
  },
};

export async function executePROVSearch(input: {
  query?: string;
  series?: string;
  agency?: string;
  recordForm?: string;
  dateFrom?: string;
  dateTo?: string;
  digitisedOnly?: boolean;
  limit?: number;
}): Promise<MCPToolResponse> {
  try {
    // Validate at least one search parameter
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

    const params: PROVSearchParams = {
      query: input.query,
      series: input.series,
      agency: input.agency,
      recordForm: input.recordForm,
      startDate: input.dateFrom,
      endDate: input.dateTo,
      digitisedOnly: input.digitisedOnly ?? false,
      rows: Math.min(input.limit ?? 20, 100),
    };

    const result = await provClient.search(params);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'prov',
          totalResults: result.totalResults,
          returned: result.records.length,
          records: result.records.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description?.substring(0, 200),
            series: r.series,
            seriesTitle: r.seriesTitle,
            agency: r.agency,
            recordForm: r.recordForm,
            dateRange: r.startDate && r.endDate
              ? `${r.startDate} - ${r.endDate}`
              : r.startDate || r.endDate,
            digitised: r.digitised,
            url: r.url,
            iiifManifest: r.iiifManifest,
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
