/**
 * VHD List Themes Tool - List all heritage themes
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { vhdClient } from '../client.js';

export const vhdListThemesTool: SourceTool = {
  schema: {
    name: 'vhd_list_themes',
    description: 'List heritage themes.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  async execute() {
    try {
      const themes = await vhdClient.listThemes();

      return successResponse({
        source: 'vhd',
        count: themes.length,
        themes: themes.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
