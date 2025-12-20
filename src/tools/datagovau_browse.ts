/**
 * data.gov.au Browse Tools - Explore organisations, groups, and tags
 */

import { dataGovAUClient } from '../clients/datagovau_client.js';
import type { MCPToolResponse } from '../types.js';

// ============================================================================
// List Organizations Tool
// ============================================================================

export const dataGovAUListOrganizationsSchema = {
  name: 'datagovau_list_organizations',
  description: `List organisations that publish data on data.gov.au.

Returns 800+ government organisations including:
- Federal agencies (ABS, BOM, Geoscience Australia)
- State government departments
- Local councils
- Research institutions

Use the organisation slug to filter search results.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum organisations to return (default: 50)',
        default: 50,
      },
    },
    required: [],
  },
};

export async function executeDataGovAUListOrganizations(input: {
  limit?: number;
}): Promise<MCPToolResponse> {
  try {
    const organizations = await dataGovAUClient.listOrganizations(true, input.limit ?? 50);

    // Sort by package count descending
    const sorted = organizations.sort((a, b) => b.packageCount - a.packageCount);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'datagovau',
          count: sorted.length,
          organizations: sorted.map(o => ({
            name: o.name,
            title: o.title,
            datasetCount: o.packageCount,
            description: o.description?.substring(0, 150),
          })),
          tip: 'Use the "name" field to filter searches with organization parameter',
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
// Get Organization Tool
// ============================================================================

export const dataGovAUGetOrganizationSchema = {
  name: 'datagovau_get_organization',
  description: `Get details about a specific organisation on data.gov.au.

Returns organisation metadata and optionally their published datasets.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      organization: {
        type: 'string',
        description: 'Organisation ID or slug (e.g., "abs", "bom")',
      },
      includeDatasets: {
        type: 'boolean',
        description: 'Include list of datasets (default: false)',
        default: false,
      },
    },
    required: ['organization'],
  },
};

export async function executeDataGovAUGetOrganization(input: {
  organization: string;
  includeDatasets?: boolean;
}): Promise<MCPToolResponse> {
  try {
    const org = await dataGovAUClient.getOrganization(
      input.organization,
      input.includeDatasets ?? false
    );

    if (!org) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Organisation not found: ${input.organization}`,
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
          organization: {
            id: org.id,
            name: org.name,
            title: org.title,
            description: org.description,
            datasetCount: org.packageCount,
            created: org.created,
            url: `https://data.gov.au/organization/${org.name}`,
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
// List Groups Tool
// ============================================================================

export const dataGovAUListGroupsSchema = {
  name: 'datagovau_list_groups',
  description: `List dataset groups (categories) on data.gov.au.

Groups are thematic categories that datasets can belong to.
Use group names to filter search results.`,
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export async function executeDataGovAUListGroups(_input: Record<string, never>): Promise<MCPToolResponse> {
  try {
    const groups = await dataGovAUClient.listGroups(true);

    // Sort by package count descending
    const sorted = groups.sort((a, b) => b.packageCount - a.packageCount);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'datagovau',
          count: sorted.length,
          groups: sorted.map(g => ({
            name: g.name,
            title: g.title,
            datasetCount: g.packageCount,
            description: g.description?.substring(0, 150),
          })),
          tip: 'Use group names in the "groups" parameter when searching',
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
// Get Group Tool
// ============================================================================

export const dataGovAUGetGroupSchema = {
  name: 'datagovau_get_group',
  description: `Get details about a specific group (category) on data.gov.au.

Returns group metadata and optionally datasets in this group.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      group: {
        type: 'string',
        description: 'Group ID or slug',
      },
      includeDatasets: {
        type: 'boolean',
        description: 'Include list of datasets (default: false)',
        default: false,
      },
    },
    required: ['group'],
  },
};

export async function executeDataGovAUGetGroup(input: {
  group: string;
  includeDatasets?: boolean;
}): Promise<MCPToolResponse> {
  try {
    const group = await dataGovAUClient.getGroup(
      input.group,
      input.includeDatasets ?? false
    );

    if (!group) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: `Group not found: ${input.group}`,
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
          group: {
            id: group.id,
            name: group.name,
            title: group.title,
            description: group.description,
            datasetCount: group.packageCount,
            url: `https://data.gov.au/group/${group.name}`,
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
// List Tags Tool
// ============================================================================

export const dataGovAUListTagsSchema = {
  name: 'datagovau_list_tags',
  description: `List popular tags used on data.gov.au datasets.

Tags help categorise and discover datasets.
Use tags to filter search results.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Filter tags matching this text',
      },
    },
    required: [],
  },
};

export async function executeDataGovAUListTags(input: {
  query?: string;
}): Promise<MCPToolResponse> {
  try {
    const tags = await dataGovAUClient.listTags(input.query);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          source: 'datagovau',
          query: input.query || null,
          count: tags.length,
          tags: tags.slice(0, 100), // Limit output
          tip: 'Use these tags in the "tags" parameter when searching',
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
