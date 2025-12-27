/**
 * Trove Get List Tool - Get user-curated research list by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const troveGetListTool: SourceTool = {
  schema: {
    name: 'trove_get_list',
    description: 'Get user-curated research list by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        listId: { type: 'string', description: PARAMS.LIST_ID },
        includeItems: { type: 'boolean', description: PARAMS.INCLUDE_ITEMS, default: true },
      },
      required: ['listId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      listId?: string;
      includeItems?: boolean;
    };

    if (!input.listId) {
      return errorResponse('listId is required');
    }

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    try {
      const include = input.includeItems !== false ? ['listitems'] as ('listitems')[] : undefined;
      const list = await troveClient.getList(input.listId, { include });

      if (!list) {
        return errorResponse(`List not found: ${input.listId}`);
      }

      const response: Record<string, unknown> = {
        source: 'trove',
        list: {
          id: list.id,
          title: list.title,
          creator: list.creator,
          description: list.description,
          itemCount: list.listItemCount,
          created: list.dateCreated,
          lastUpdated: list.dateLastUpdated,
          thumbnailUrl: list.thumbnailUrl,
          url: list.troveUrl,
        },
      };

      // Include items if available
      if (list.items && list.items.length > 0) {
        response.items = list.items.map((item) => {
          const result: Record<string, unknown> = {};

          if (item.note) {
            result.note = item.note;
          }

          if (item.work) {
            result.work = {
              id: item.work.id,
              title: item.work.title,
              contributor: item.work.contributor,
              type: item.work.type,
              url: item.work.troveUrl,
            };
          }

          if (item.article) {
            result.article = {
              id: item.article.id,
              heading: item.article.heading,
              title: item.article.title,
              date: item.article.date,
              url: item.article.troveUrl,
            };
          }

          if (item.people) {
            result.people = item.people;
          }

          if (item.externalWebsite) {
            result.externalWebsite = item.externalWebsite;
          }

          return result;
        });
      }

      return successResponse(response);
    } catch (error) {
      return errorResponse(error);
    }
  },
};
