/**
 * VHD Get Shipwreck Tool - Get detailed shipwreck by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { vhdClient } from '../client.js';

export const vhdGetShipwreckTool: SourceTool = {
  schema: {
    name: 'vhd_get_shipwreck',
    description: 'Get detailed Victorian shipwreck record by ID. Returns full history, vessel details, cargo, and loss information.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: 'Shipwreck ID (from search results)',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id?: number };

    if (!input.id) {
      return errorResponse('id is required');
    }

    try {
      const shipwreck = await vhdClient.getShipwreck(input.id);

      if (!shipwreck) {
        return errorResponse(`Shipwreck not found: ${input.id}`);
      }

      return successResponse({
        source: 'vhd',
        shipwreck: {
          id: shipwreck.id,
          name: shipwreck.name,
          location: shipwreck.sw_location,
          description: shipwreck.description,
          history: shipwreck.history,
          vesselType: shipwreck.vessel_type,
          constructionDate: shipwreck.construction_date,
          lossDate: shipwreck.loss_date,
          causeOfLoss: shipwreck.cause_of_loss,
          tonnage: shipwreck.tonnage,
          length: shipwreck.length,
          cargo: shipwreck.cargo,
          crew: shipwreck.crew,
          passengers: shipwreck.passengers,
          livesLost: shipwreck.lives_lost,
          heritageAuthority: shipwreck.heritage_authority_name,
          vhrNumber: shipwreck.vhr_number,
          url: shipwreck.url,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
