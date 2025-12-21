/**
 * data.gov.au Search Tool - Search Australian government open data
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { dataGovAUClient } from '../client.js';

export const dataGovAUSearchTool: SourceTool = {
  schema: {
    name: 'datagovau_search',
    description: 'Search data.gov.au for Australian government open datasets.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search keywords',
        },
        organization: {
          type: 'string',
          description: 'Organisation slug filter',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags',
        },
        format: {
          type: 'string',
          description: 'Resource format filter',
        },
        sort: {
          type: 'string',
          enum: ['relevance', 'metadata_modified desc', 'metadata_modified asc', 'title asc', 'title desc'],
          description: 'Sort order',
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
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      organization?: string;
      tags?: string[];
      format?: string;
      sort?: string;
      limit?: number;
      offset?: number;
    };

    try {
      const result = await dataGovAUClient.search({
        query: input.query,
        organization: input.organization,
        tags: input.tags,
        format: input.format,
        sort: input.sort,
        limit: Math.min(input.limit ?? 20, 100),
        offset: input.offset ?? 0,
      });

      return successResponse({
        source: 'datagovau',
        totalResults: result.count,
        returned: result.datasets.length,
        offset: input.offset ?? 0,
        datasets: result.datasets.map(d => ({
          id: d.id,
          name: d.name,
          title: d.title,
          description: d.notes?.substring(0, 200),
          organization: d.organization?.title,
          resourceCount: d.resources.length,
          formats: [...new Set(d.resources.map(r => r.format))],
          tags: d.tags.slice(0, 5),
          modified: d.metadataModified,
          license: d.licenseTitle,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
