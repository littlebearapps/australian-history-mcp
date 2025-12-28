/**
 * NMA Get Object Tool - Get detailed museum object by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const nmaGetObjectTool: SourceTool = {
  schema: {
    name: 'nma_get_object',
    description: 'Get museum object by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: PARAMS.ID },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id?: string };

    if (!input.id) {
      return errorResponse('id is required');
    }

    try {
      const obj = await nmaClient.getObject(input.id);

      if (!obj) {
        return errorResponse(`Object not found: ${input.id}`);
      }

      return successResponse({
        source: 'nma',
        object: {
          id: obj.id,
          title: obj.title,
          types: obj.additionalType,
          collection: obj.collection ? {
            id: obj.collection.id,
            title: obj.collection.title,
          } : undefined,
          identifier: obj.identifier,
          materials: obj.medium?.map((m) => m.title),
          dimensions: obj.extent ? {
            length: obj.extent.length,
            width: obj.extent.width,
            height: obj.extent.height,
            depth: obj.extent.depth,
            weight: obj.extent.weight,
            units: obj.extent.unitText,
          } : undefined,
          physicalDescription: obj.physicalDescription,
          significanceStatement: obj.significanceStatement,
          places: obj.spatial?.map((p) => ({
            title: p.title,
            role: p.roleName,
            coordinates: p.geo,
          })),
          dates: obj.temporal?.map((t) => ({
            title: t.title,
            startDate: t.startDate,
            endDate: t.endDate,
          })),
          media: obj.hasVersion?.map((v) => ({
            id: v.id,
            format: v.format,
            identifier: v.identifier,
          })),
          metadata: {
            modified: obj._meta?.modified,
            issued: obj._meta?.issued,
            copyright: obj._meta?.copyright,
            licence: obj._meta?.licence,
            webUrl: obj._meta?.hasFormat,
          },
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
