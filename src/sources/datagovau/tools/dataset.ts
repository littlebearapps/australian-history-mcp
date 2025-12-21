/**
 * data.gov.au Dataset Tools - Get dataset and resource details
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { dataGovAUClient } from '../client.js';

/**
 * Get full dataset details
 */
export const dataGovAUGetDatasetTool: SourceTool = {
  schema: {
    name: 'datagovau_get_dataset',
    description: 'Get full dataset details including all resources and metadata.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        dataset: {
          type: 'string',
          description: 'Dataset ID or name',
        },
      },
      required: ['dataset'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { dataset: string };

    try {
      const dataset = await dataGovAUClient.getDataset(input.dataset);

      if (!dataset) {
        return errorResponse(`Dataset "${input.dataset}" not found`);
      }

      return successResponse({
        source: 'datagovau',
        dataset: {
          id: dataset.id,
          name: dataset.name,
          title: dataset.title,
          description: dataset.notes,
          organization: dataset.organization,
          author: dataset.author,
          maintainer: dataset.maintainer,
          license: {
            id: dataset.licenseId,
            title: dataset.licenseTitle,
          },
          created: dataset.metadataCreated,
          modified: dataset.metadataModified,
          tags: dataset.tags,
          url: dataset.url,
          resources: dataset.resources.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            format: r.format,
            url: r.url,
            size: r.size,
            lastModified: r.lastModified,
            datastoreActive: r.datastoreActive,
          })),
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Get resource details
 */
export const dataGovAUGetResourceTool: SourceTool = {
  schema: {
    name: 'datagovau_get_resource',
    description: 'Get resource details including download URL and datastore status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        resourceId: {
          type: 'string',
          description: 'Resource ID (UUID)',
        },
      },
      required: ['resourceId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { resourceId: string };

    try {
      const resource = await dataGovAUClient.getResource(input.resourceId);

      if (!resource) {
        return errorResponse(`Resource "${input.resourceId}" not found`);
      }

      return successResponse({
        source: 'datagovau',
        resource: {
          id: resource.id,
          name: resource.name,
          description: resource.description,
          format: resource.format,
          url: resource.url,
          size: resource.size,
          lastModified: resource.lastModified,
          datastoreActive: resource.datastoreActive,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Query datastore (tabular data)
 */
export const dataGovAUDatastoreSearchTool: SourceTool = {
  schema: {
    name: 'datagovau_datastore_search',
    description: 'Query tabular data directly from a datastore-enabled resource.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        resourceId: {
          type: 'string',
          description: 'Resource ID (UUID)',
        },
        query: {
          type: 'string',
          description: 'Full-text search query within the data',
        },
        filters: {
          type: 'object',
          additionalProperties: true,
          description: 'Field-value filters',
        },
        limit: {
          type: 'number',
          description: 'Maximum rows to return (1-100)',
          default: 20,
        },
        offset: {
          type: 'number',
          description: 'Number of rows to skip (for pagination)',
          default: 0,
        },
      },
      required: ['resourceId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      resourceId: string;
      query?: string;
      filters?: Record<string, string | string[]>;
      limit?: number;
      offset?: number;
    };

    try {
      const result = await dataGovAUClient.datastoreSearch({
        resourceId: input.resourceId,
        query: input.query,
        filters: input.filters,
        limit: Math.min(input.limit ?? 20, 100),
        offset: input.offset ?? 0,
      });

      if (!result) {
        return errorResponse(
          `Datastore not available for resource "${input.resourceId}". ` +
          'The resource may not have datastore enabled or does not exist.'
        );
      }

      return successResponse({
        source: 'datagovau',
        resourceId: result.resourceId,
        total: result.total,
        returned: result.records.length,
        offset: input.offset ?? 0,
        fields: result.fields,
        records: result.records,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
