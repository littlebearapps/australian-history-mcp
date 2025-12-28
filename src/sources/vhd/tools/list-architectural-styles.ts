/**
 * VHD List Architectural Styles Tool - List all architectural style classifications
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { vhdClient } from '../client.js';

export const vhdListArchitecturalStylesTool: SourceTool = {
  schema: {
    name: 'vhd_list_architectural_styles',
    description: 'List architectural style classifications.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  async execute() {
    try {
      const styles = await vhdClient.listArchitecturalStyles();

      return successResponse({
        source: 'vhd',
        count: styles.length,
        architecturalStyles: styles.map((s) => ({
          id: s.id,
          name: s.name,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
