/**
 * GHAP Harvest Tool - Bulk download placename records
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { ghapClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';
import { AU_STATES_UPPER } from '../../../core/enums.js';
import type { GHAPSearchParams } from '../types.js';

export const ghapHarvestTool: SourceTool = {
  schema: {
    name: 'ghap_harvest',
    description: 'Bulk download placename records (330,000+ available).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: PARAMS.QUERY_OPTIONAL },
        state: { type: 'string', description: PARAMS.STATE, enum: AU_STATES_UPPER },
        lga: { type: 'string', description: PARAMS.LGA },
        bbox: { type: 'string', description: PARAMS.BBOX },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      query?: string;
      state?: string;
      lga?: string;
      bbox?: string;
      maxRecords?: number;
    };

    // Require at least one filter
    if (!input.query && !input.state && !input.lga && !input.bbox) {
      return errorResponse('At least one of query, state, lga, or bbox is required for harvesting');
    }

    try {
      const maxRecords = Math.min(input.maxRecords ?? 100, 500);

      const params: GHAPSearchParams = {
        limit: maxRecords,
        state: input.state as GHAPSearchParams['state'],
        lga: input.lga,
        bbox: input.bbox,
      };

      if (input.query) {
        params.containsname = input.query;
      }

      const result = await ghapClient.search(params);

      return successResponse({
        source: 'ghap',
        harvested: result.places.length,
        maxRecords,
        places: result.places.map((p) => ({
          id: p.id,
          name: p.name,
          state: p.state,
          lga: p.lga,
          featureType: p.featureType,
          latitude: p.latitude,
          longitude: p.longitude,
          source: p.source,
          dateRange: p.dateRange,
          url: p.url,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
