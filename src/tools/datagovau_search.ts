/**
 * data.gov.au Search Tool - Search Australia's national open data portal
 */

import { dataGovAUClient } from '../clients/datagovau_client.js';
import type { MCPToolResponse, DataGovAUSearchParams } from '../types.js';

export const dataGovAUSearchSchema = {
  name: 'datagovau_search',
  description: `Search data.gov.au for Australian government datasets.

Use this to find:
- Open data from federal, state, and local government
- Statistical datasets from ABS
- Geographic and spatial data
- Environmental and climate data
- Health, education, and transport datasets

data.gov.au aggregates 85,000+ datasets from 800+ government organisations.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search keywords (e.g., "heritage victoria", "census population")',
      },
      organization: {
        type: 'string',
        description: 'Filter by organisation slug (e.g., "abs", "bom", "geoscience-australia")',
      },
      format: {
        type: 'string',
        description: 'Filter by resource format (e.g., "CSV", "JSON", "GeoJSON", "SHP")',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by tags (e.g., ["environment", "water"])',
      },
      sort: {
        type: 'string',
        description: 'Sort order (e.g., "metadata_modified desc", "relevance")',
        enum: [
          'relevance',
          'metadata_modified desc',
          'metadata_modified asc',
          'title asc',
          'title desc',
        ],
      },
      limit: {
        type: 'number',
        description: 'Maximum results to return (1-100)',
        default: 20,
      },
      offset: {
        type: 'number',
        description: 'Number of results to skip (for pagination)',
        default: 0,
      },
    },
    required: [],
  },
};

export async function executeDataGovAUSearch(input: {
  query?: string;
  organization?: string;
  format?: string;
  tags?: string[];
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<MCPToolResponse> {
  try {
    // Allow empty searches (returns recent datasets)
    const params: DataGovAUSearchParams = {
      query: input.query,
      organization: input.organization,
      format: input.format,
      tags: input.tags,
      sort: input.sort,
      limit: Math.min(input.limit ?? 20, 100),
      offset: input.offset ?? 0,
    };

    const result = await dataGovAUClient.search(params);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'datagovau',
          totalResults: result.count,
          returned: result.datasets.length,
          offset: input.offset ?? 0,
          datasets: result.datasets.map(d => ({
            id: d.id,
            name: d.name,
            title: d.title,
            description: d.notes?.substring(0, 300),
            organization: d.organization?.title,
            resourceCount: d.resources.length,
            formats: [...new Set(d.resources.map(r => r.format))],
            tags: d.tags.slice(0, 10),
            license: d.licenseTitle || d.licenseId,
            modified: d.metadataModified,
            url: `https://data.gov.au/dataset/${d.name}`,
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
