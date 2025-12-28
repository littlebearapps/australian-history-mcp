/**
 * ACMI Get Related Tool - Fetch related works for a given work
 *
 * SEARCH-017: Related Records Discovery
 *
 * Returns related works including:
 * - parts: Child works if this is a group/series
 * - part_of: Parent work if this is a part
 * - part_siblings: Other parts of the same parent
 * - group_works: Works in the same group
 * - group_siblings: Other works in the same group
 * - recommendations: Algorithmically suggested similar works
 * - constellations: Curated collections containing this work
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';

interface RelatedWork {
  id: number;
  title: string;
  type: string;
  relationship: string;
  url: string;
}

interface ACMIRelatedResult {
  workId: number;
  workTitle: string;
  totalRelated: number;
  parts: RelatedWork[];
  partOf: RelatedWork | null;
  partSiblings: RelatedWork[];
  groupWorks: RelatedWork[];
  groupSiblings: RelatedWork[];
  recommendations: RelatedWork[];
  constellations: Array<{
    id: number;
    name: string;
    isPrimary: boolean;
    url: string;
  }>;
}

export const acmiGetRelatedTool: SourceTool = {
  schema: {
    name: 'acmi_get_related',
    description: 'Get related works for an ACMI work (parts, groups, recommendations, constellations).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: 'ACMI work ID',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const id = args.id as number;

    if (!id || typeof id !== 'number') {
      return errorResponse('Work ID is required');
    }

    try {
      const work = await acmiClient.getWork(id);

      if (!work) {
        return errorResponse(`Work not found: ${id}`);
      }

      // Extract related works
      const parts = extractRelatedWorks(work.parts as unknown[], 'part');
      const partOf = extractSingleRelated(work.part_of, 'parent');
      const partSiblings = extractRelatedWorks(work.part_siblings as unknown[], 'sibling');
      const groupWorks = extractRelatedWorks(work.group_works as unknown[], 'group_member');
      const groupSiblings = extractRelatedWorks(work.group_siblings as unknown[], 'group_sibling');
      const recommendations = extractRelatedWorks(work.recommendations as unknown[], 'recommended');

      // Extract constellations
      const constellations = [
        ...extractConstellations(work.constellations_primary as unknown[], true),
        ...extractConstellations(work.constellations_other as unknown[], false),
      ];

      const totalRelated =
        parts.length +
        (partOf ? 1 : 0) +
        partSiblings.length +
        groupWorks.length +
        groupSiblings.length +
        recommendations.length +
        constellations.length;

      const result: ACMIRelatedResult = {
        workId: work.id,
        workTitle: work.title,
        totalRelated,
        parts,
        partOf,
        partSiblings,
        groupWorks,
        groupSiblings,
        recommendations,
        constellations,
      };

      return successResponse({
        source: 'acmi',
        ...result,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Extract related works from an array
 */
function extractRelatedWorks(items: unknown[], relationship: string): RelatedWork[] {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => ({
      id: item.id as number,
      title: (item.title as string) ?? 'Untitled',
      type: (item.type as string) ?? 'Unknown',
      relationship,
      url: `https://www.acmi.net.au/works/${item.id}/`,
    }));
}

/**
 * Extract a single related work
 */
function extractSingleRelated(item: unknown, relationship: string): RelatedWork | null {
  if (!item || typeof item !== 'object') return null;

  const obj = item as Record<string, unknown>;
  return {
    id: obj.id as number,
    title: (obj.title as string) ?? 'Untitled',
    type: (obj.type as string) ?? 'Unknown',
    relationship,
    url: `https://www.acmi.net.au/works/${obj.id}/`,
  };
}

/**
 * Extract constellations
 */
function extractConstellations(
  items: unknown[],
  isPrimary: boolean
): Array<{ id: number; name: string; isPrimary: boolean; url: string }> {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => ({
      id: item.id as number,
      name: (item.name as string) ?? (item.title as string) ?? 'Untitled',
      isPrimary,
      url: `https://www.acmi.net.au/constellations/${item.slug ?? item.id}/`,
    }));
}
