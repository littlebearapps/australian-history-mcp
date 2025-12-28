/**
 * Trove Get Versions Tool - Get work versions with library holdings
 *
 * SEARCH-017: Related Records Discovery
 *
 * Returns all versions of a work with their holdings information.
 * Useful for finding which libraries hold specific editions or formats.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { troveClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

interface VersionHolding {
  nuc: string;
  name?: string;
  url?: string;
  callNumber?: string;
}

interface WorkVersion {
  id: string;
  type: string[];
  issued?: string;
  holdingsCount: number;
  holdings: VersionHolding[];
  links: Array<{
    url: string;
    type: string;
    text?: string;
  }>;
}

interface TroveVersionsResult {
  workId: string;
  workTitle: string;
  totalVersions: number;
  totalHoldings: number;
  versions: WorkVersion[];
}

export const troveGetVersionsTool: SourceTool = {
  schema: {
    name: 'trove_get_versions',
    description: 'Get all versions of a Trove work with library holdings information.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workId: {
          type: 'string',
          description: PARAMS.WORK_ID,
        },
      },
      required: ['workId'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const workId = args.workId as string;

    if (!workId || typeof workId !== 'string') {
      return errorResponse('workId is required');
    }

    if (!troveClient.hasApiKey()) {
      return errorResponse('TROVE_API_KEY not configured');
    }

    try {
      // Get work with versions and holdings included
      const work = await troveClient.getWork(workId, {
        reclevel: 'full',
        include: ['workversions', 'holdings'],
      });

      if (!work) {
        return errorResponse(`Work not found: ${workId}`);
      }

      // Process versions
      const versions: WorkVersion[] = (work.versions ?? []).map((v) => ({
        id: v.id,
        type: v.type,
        issued: v.issued,
        holdingsCount: v.holdingsCount,
        holdings: (v.holdings ?? []).map((h) => ({
          nuc: h.nuc,
          name: h.name,
          url: h.url,
          callNumber: h.callNumber,
        })),
        links: (v.links ?? []).map((l) => ({
          url: l.url,
          type: l.linktype,
          text: l.linktext,
        })),
      }));

      // Calculate total holdings across all versions
      const totalHoldings = versions.reduce((sum, v) => sum + v.holdingsCount, 0);

      const result: TroveVersionsResult = {
        workId: work.id,
        workTitle: work.title,
        totalVersions: versions.length,
        totalHoldings,
        versions,
      };

      return successResponse({
        source: 'trove',
        ...result,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
