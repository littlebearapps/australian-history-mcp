/**
 * VHD List Periods Tool - List all time periods for heritage classification
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { vhdClient } from '../client.js';

export const vhdListPeriodsTool: SourceTool = {
  schema: {
    name: 'vhd_list_periods',
    description: 'List heritage time periods.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  async execute() {
    try {
      const periods = await vhdClient.listPeriods();

      return successResponse({
        source: 'vhd',
        count: periods.length,
        periods: periods.map((p) => ({
          id: p.id,
          name: p.name,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
