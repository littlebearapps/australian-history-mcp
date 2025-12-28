/**
 * Trove Get Work Tool - Get book, image, map, music, or archive details by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { REC_LEVELS, TROVE_INCLUDE_OPTIONS } from '../../../core/enums.js';
import type { TroveRecLevel, TroveIncludeOption } from '../types.js';

export const troveGetWorkTool: SourceTool = {
  schema: {
    name: 'trove_get_work',
    description: 'Get work details (book, image, map, music).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workId: { type: 'string', description: PARAMS.WORK_ID },
        reclevel: { type: 'string', description: PARAMS.RECLEVEL, enum: REC_LEVELS, default: 'full' },
        include: { type: 'array', description: PARAMS.INCLUDE, items: { type: 'string', enum: TROVE_INCLUDE_OPTIONS } },
      },
      required: ['workId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      workId?: string;
      reclevel?: TroveRecLevel;
      include?: TroveIncludeOption[];
    };

    if (!input.workId) {
      return errorResponse('workId is required');
    }

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    try {
      const work = await troveClient.getWork(input.workId, {
        reclevel: input.reclevel || 'full',
        include: input.include,
      });

      if (!work) {
        return errorResponse(`Work not found: ${input.workId}`);
      }

      // Build response with all available fields
      const response: Record<string, unknown> = {
        source: 'trove',
        work: {
          id: work.id,
          title: work.title,
          contributor: work.contributor,
          issued: work.issued,
          type: work.type,
          subjects: work.subjects,
          abstract: work.abstract,
          tableOfContents: work.tableOfContents,
          language: work.language,
          identifier: work.identifier,
          holdingsCount: work.holdingsCount,
          versionCount: work.versionCount,
          url: work.troveUrl,
          thumbnailUrl: work.thumbnailUrl,
        },
      };

      // Include holdings if requested and available
      if (work.holdings && work.holdings.length > 0) {
        response.holdings = work.holdings.map((h) => ({
          nuc: h.nuc,
          name: h.name,
          url: h.url,
          callNumber: h.callNumber,
        }));
      }

      // Include links if requested and available
      if (work.links && work.links.length > 0) {
        response.links = work.links.map((l) => ({
          url: l.url,
          type: l.linktype,
          text: l.linktext,
        }));
      }

      // Include versions if requested and available
      if (work.versions && work.versions.length > 0) {
        response.versions = work.versions.map((v) => ({
          id: v.id,
          type: v.type,
          issued: v.issued,
          holdingsCount: v.holdingsCount,
        }));
      }

      return successResponse(response);
    } catch (error) {
      return errorResponse(error);
    }
  },
};
