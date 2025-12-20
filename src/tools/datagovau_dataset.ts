/**
 * data.gov.au Dataset Tools - Get dataset details, resources, and query datastore
 */

import { dataGovAUClient } from '../clients/datagovau_client.js';
import type { MCPToolResponse } from '../types.js';

// ============================================================================
// Get Dataset Tool
// ============================================================================

export const dataGovAUGetDatasetSchema = {
  name: 'datagovau_get_dataset',
  description: `Get full details of a specific dataset from data.gov.au.

Returns complete metadata including:
- All resources (files, APIs) with download URLs
- Full description and documentation
- Organization and contact details
- License information`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      dataset: {
        type: 'string',
        description: 'Dataset ID or name (e.g., "heritage-inventory" or UUID)',
      },
    },
    required: ['dataset'],
  },
};

export async function executeDataGovAUGetDataset(input: {
  dataset: string;
}): Promise<MCPToolResponse> {
  try {
    const dataset = await dataGovAUClient.getDataset(input.dataset);

    if (!dataset) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Dataset not found: ${input.dataset}`,
          }),
        }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'datagovau',
          dataset: {
            id: dataset.id,
            name: dataset.name,
            title: dataset.title,
            description: dataset.notes,
            organization: dataset.organization,
            author: dataset.author,
            maintainer: dataset.maintainer,
            license: dataset.licenseTitle || dataset.licenseId,
            created: dataset.metadataCreated,
            modified: dataset.metadataModified,
            tags: dataset.tags,
            url: `https://data.gov.au/dataset/${dataset.name}`,
            resources: dataset.resources.map(r => ({
              id: r.id,
              name: r.name,
              description: r.description?.substring(0, 200),
              format: r.format,
              url: r.url,
              size: r.size,
              lastModified: r.lastModified,
              datastoreEnabled: r.datastoreActive,
            })),
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
// Get Resource Tool
// ============================================================================

export const dataGovAUGetResourceSchema = {
  name: 'datagovau_get_resource',
  description: `Get details of a specific resource (file or API) from data.gov.au.

Resources are the actual data files within a dataset - CSV, JSON, GeoJSON, APIs, etc.
Use this to get the download URL and check if datastore querying is available.`,
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
};

export async function executeDataGovAUGetResource(input: {
  resourceId: string;
}): Promise<MCPToolResponse> {
  try {
    const resource = await dataGovAUClient.getResource(input.resourceId);

    if (!resource) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Resource not found: ${input.resourceId}`,
          }),
        }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'datagovau',
          resource: {
            id: resource.id,
            name: resource.name,
            description: resource.description,
            format: resource.format,
            url: resource.url,
            size: resource.size,
            lastModified: resource.lastModified,
            datastoreEnabled: resource.datastoreActive,
            tip: resource.datastoreActive
              ? 'Use datagovau_datastore_search to query this resource directly'
              : 'Download the file from the URL to access the data',
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
// Datastore Search Tool
// ============================================================================

export const dataGovAUDatastoreSearchSchema = {
  name: 'datagovau_datastore_search',
  description: `Query tabular data directly from a data.gov.au resource.

Only works for resources with datastore enabled (typically CSV files that have been imported).
Returns rows of data with pagination support.

Note: Not all resources have datastore enabled. Use datagovau_get_resource to check.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      resourceId: {
        type: 'string',
        description: 'Resource ID (UUID) - must have datastore enabled',
      },
      query: {
        type: 'string',
        description: 'Full-text search query within the data',
      },
      filters: {
        type: 'object',
        description: 'Field-value filters (e.g., {"state": "VIC", "year": "2020"})',
        additionalProperties: true,
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
};

export async function executeDataGovAUDatastoreSearch(input: {
  resourceId: string;
  query?: string;
  filters?: Record<string, string | string[]>;
  limit?: number;
  offset?: number;
}): Promise<MCPToolResponse> {
  try {
    const result = await dataGovAUClient.datastoreSearch({
      resourceId: input.resourceId,
      query: input.query,
      filters: input.filters,
      limit: Math.min(input.limit ?? 20, 100),
      offset: input.offset ?? 0,
    });

    if (!result) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Datastore not available for resource: ${input.resourceId}. The resource may not have datastore enabled or the ID is invalid.`,
          }),
        }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'datagovau',
          resourceId: result.resourceId,
          total: result.total,
          returned: result.records.length,
          offset: input.offset ?? 0,
          fields: result.fields.map(f => ({
            name: f.id,
            type: f.type,
          })),
          records: result.records,
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
