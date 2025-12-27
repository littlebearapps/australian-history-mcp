/**
 * ACMI Search Works Tool - Search moving image collection
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const acmiSearchWorksTool: SourceTool = {
  schema: {
    name: 'acmi_search_works',
    description: 'Search films, TV, videogames, and digital art.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY },
        type: { type: 'string', description: PARAMS.TYPE },
        year: { type: 'number', description: PARAMS.YEAR },
        page: { type: 'number', description: PARAMS.PAGE, default: 1 },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      type?: string;
      year?: number;
      page?: number;
    };

    if (!input.query) {
      return errorResponse('query is required');
    }

    try {
      const result = await acmiClient.searchWorks({
        query: input.query,
        type: input.type,
        year: input.year,
        page: input.page ?? 1,
      });

      return successResponse({
        source: 'acmi',
        totalResults: result.count,
        returned: result.results.length,
        hasNextPage: result.next !== null,
        works: result.results.map((work) => ({
          id: work.id,
          acmiId: work.acmi_id,
          title: work.title,
          type: work.type,
          slug: work.slug,
          creatorCredit: work.creator_credit,
          headlineCredit: work.headline_credit,
          description: work.brief_description?.substring(0, 300),
          productionYear: work.production_dates?.[0]?.date,
          productionPlace: work.production_places?.[0]?.name,
          isOnDisplay: work.is_on_display,
          isIndigenousContext: work.is_context_indigenous,
          webUrl: `https://www.acmi.net.au/works/${work.id}--${work.slug}/`,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
