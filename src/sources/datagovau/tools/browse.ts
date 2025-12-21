/**
 * data.gov.au Browse Tools - List organizations, groups, and tags
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { dataGovAUClient } from '../client.js';

/**
 * List organisations
 */
export const dataGovAUListOrganizationsTool: SourceTool = {
  schema: {
    name: 'datagovau_list_organizations',
    description: 'List government organisations publishing on data.gov.au.',
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
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { limit?: number };

    try {
      const orgs = await dataGovAUClient.listOrganizations(true, input.limit ?? 50);

      return successResponse({
        source: 'datagovau',
        count: orgs.length,
        organizations: orgs.map(o => ({
          name: o.name,
          title: o.title,
          description: o.description?.substring(0, 100),
          datasetCount: o.packageCount,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Get organisation details
 */
export const dataGovAUGetOrganizationTool: SourceTool = {
  schema: {
    name: 'datagovau_get_organization',
    description: 'Get organisation details and optionally their datasets.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        organization: {
          type: 'string',
          description: 'Organisation ID or slug',
        },
        includeDatasets: {
          type: 'boolean',
          description: 'Include list of datasets (default: false)',
          default: false,
        },
      },
      required: ['organization'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      organization: string;
      includeDatasets?: boolean;
    };

    try {
      const org = await dataGovAUClient.getOrganization(
        input.organization,
        input.includeDatasets ?? false
      );

      if (!org) {
        return errorResponse(`Organisation "${input.organization}" not found`);
      }

      return successResponse({
        source: 'datagovau',
        organization: {
          id: org.id,
          name: org.name,
          title: org.title,
          description: org.description,
          datasetCount: org.packageCount,
          imageUrl: org.imageUrl,
          created: org.created,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * List groups
 */
export const dataGovAUListGroupsTool: SourceTool = {
  schema: {
    name: 'datagovau_list_groups',
    description: 'List dataset groups (thematic categories).',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  async execute() {
    try {
      const groups = await dataGovAUClient.listGroups(true);

      return successResponse({
        source: 'datagovau',
        count: groups.length,
        groups: groups.map(g => ({
          name: g.name,
          title: g.title,
          description: g.description?.substring(0, 100),
          datasetCount: g.packageCount,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Get group details
 */
export const dataGovAUGetGroupTool: SourceTool = {
  schema: {
    name: 'datagovau_get_group',
    description: 'Get group details and optionally datasets in this group.',
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
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      group: string;
      includeDatasets?: boolean;
    };

    try {
      const group = await dataGovAUClient.getGroup(
        input.group,
        input.includeDatasets ?? false
      );

      if (!group) {
        return errorResponse(`Group "${input.group}" not found`);
      }

      return successResponse({
        source: 'datagovau',
        group: {
          id: group.id,
          name: group.name,
          title: group.title,
          description: group.description,
          datasetCount: group.packageCount,
          imageUrl: group.imageUrl,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * List tags
 */
export const dataGovAUListTagsTool: SourceTool = {
  schema: {
    name: 'datagovau_list_tags',
    description: 'List popular tags used on datasets.',
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
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { query?: string };

    try {
      const tags = await dataGovAUClient.listTags(input.query);

      return successResponse({
        source: 'datagovau',
        count: tags.length,
        tags: tags.slice(0, 100), // Limit for readability
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
